/* const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log("Event:", JSON.stringify(event));

    const outputBucket = process.env.OUTPUT_BUCKET;
    const outputPrefix = process.env.OUTPUT_PREFIX || "final-processed/";
    const dynamoTableName = process.env.DYNAMODB_TABLE_NAME; // DynamoDB table name

    // Get the output S3 URI from the event (processed data location)
    const s3Key = event.Records[0].s3.object.key;
    const processedFileName = s3Key.split('/').pop();  // Get the file name

    // Define the target S3 path in the final location
    const targetKey = `${outputPrefix}${processedFileName}`;

    // Define the DynamoDB item to store (you can modify this to store additional data as needed)
    const dynamoItem = {
        TableName: dynamoTableName,
        Item: {
            fileName: processedFileName,
            s3Key: targetKey,
            timestamp: new Date().toISOString(),
            status: "processed"
        }
    };

    try {
        // Copy the file from the raw location to the final processed location in S3
        const copyParams = {
            Bucket: outputBucket,
            CopySource: `${outputBucket}/${s3Key}`,
            Key: targetKey
        };

        // Perform the S3 copy operation
        await s3.copyObject(copyParams).promise();
        console.log(`File moved to ${targetKey}`);

        // Store the file metadata in DynamoDB
        await dynamoDB.put(dynamoItem).promise();
        console.log(`DynamoDB record added for file: ${processedFileName}`);

        // Optionally, delete the original file (if required)
        // await s3.deleteObject({ Bucket: outputBucket, Key: s3Key }).promise();

    } catch (error) {
        console.error("Error storing processed data:", error);
        throw error;
    }
};
 */

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log("Event:", JSON.stringify(event));

    const outputBucket = process.env.OUTPUT_BUCKET;
    const outputPrefix = process.env.OUTPUT_PREFIX || "final-processed/"; // Write to final-processed/
    const dynamoTableName = process.env.DYNAMODB_TABLE_NAME; // DynamoDB table name

    // Get the output S3 URI from the event (processed data location)
    const s3Key = event.Records[0].s3.object.key;
    const processedFileName = s3Key.split('/').pop();  // Get the file name

    // Define the target S3 path in the final location
    const targetKey = `${outputPrefix}${processedFileName}`;

    // Define the DynamoDB item to store (you can modify this to store additional data as needed)
    const dynamoItem = {
        TableName: dynamoTableName,
        Item: {
            fileName: processedFileName,
            s3Key: targetKey,
            timestamp: new Date().toISOString(),
            status: "processed"
        }
    };

    try {
        // Copy the file from the prefinal-output location to the final processed location in S3
        const copyParams = {
            Bucket: outputBucket,
            CopySource: `${outputBucket}/${s3Key}`,
            Key: targetKey
        };

        // Perform the S3 copy operation
        await s3.copyObject(copyParams).promise();
        console.log(`File moved to ${targetKey}`);

        // Store the file metadata in DynamoDB
        await dynamoDB.put(dynamoItem).promise();
        console.log(`DynamoDB record added for file: ${processedFileName}`);

        // Optionally, delete the original file (if required)
        // await s3.deleteObject({ Bucket: outputBucket, Key: s3Key }).promise();

    } catch (error) {
        console.error("Error storing processed data:", error);
        throw error;
    }
};
