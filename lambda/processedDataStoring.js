const s3 = new (require('aws-sdk')).S3();
const dynamoDB = new (require('aws-sdk')).DynamoDB.DocumentClient(); // for storing
const sagemaker = new (require('aws-sdk')).SageMaker(); // for triggering jobs

exports.handler = async () => {
  console.log("📦 ProcessedDataStoringLambda invoked manually.");

  const outputBucket = process.env.OUTPUT_BUCKET;
  const outputPrefix = process.env.OUTPUT_PREFIX || "final-processed/";
  const dynamoTableName = process.env.DYNAMODB_TABLE_NAME;

  const inputKey = "prefinal-output/sample-output.csv"; // ✅ assume this file exists
  const fileName = inputKey.split('/').pop();
  const targetKey = `${outputPrefix}${fileName}`;

  try {
    // Copy file to final-processed/
    await s3.copyObject({
      Bucket: outputBucket,
      CopySource: `${outputBucket}/${inputKey}`,
      Key: targetKey
    }).promise();
    console.log(`✅ File copied to: ${targetKey}`);

    // Write record to DynamoDB
    await dynamoDB.put({
      TableName: dynamoTableName,
      Item: {
        fileName: fileName,
        s3Key: targetKey,
        timestamp: new Date().toISOString(),
        status: "processed"
      }
    }).promise();
    console.log(`✅ Metadata written to DynamoDB for: ${fileName}`);
  } catch (error) {
    console.error("❌ Error storing processed data:", error);
    throw error;
  }
};
