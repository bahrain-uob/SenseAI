const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const bucketName = process.env.BUCKET_NAME;
  const prefix = 'processed/'; // adjust if needed

  try {
    const list = await s3.listObjectsV2({
      Bucket: bucketName,
      Prefix: prefix
    }).promise();

    if (!list.Contents || list.Contents.length === 0) {
      throw new Error('No files found in S3');
    }

    const latest = list.Contents.sort((a, b) =>
      new Date(b.LastModified) - new Date(a.LastModified)
    )[0];

    const s3Uri = `s3://${bucketName}/${latest.Key}`;
    console.log('✅ S3 URI to use with SageMaker:', s3Uri);

    return {
      statusCode: 200,
      body: JSON.stringify({ s3Uri })
    };

  } catch (err) {
    console.error('❌ Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

