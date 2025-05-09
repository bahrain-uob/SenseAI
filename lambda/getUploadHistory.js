/* const AWS = require("aws-sdk");

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.UPLOAD_BUCKET;

exports.handler = async (event) => {
  
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Prefix: '', // optionally set a user-based prefix here
    };

    const data = await s3.listObjectsV2(params).promise();
    const files = data.Contents?.map(file => ({
      key: file.Key,
      lastModified: file.LastModified,
      size: file.Size,
      url: `url:https://${BUCKET_NAME}.s3.amazonaws.com/${file.Key}`,
    }));

    return {
      statusCode: 200,
      headers: { 
        'Access-Control-Allow-Origin': ['https://d10uresn4y47do.cloudfront.net'],
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": ["GET","OPTIONS"]

      },
      body: JSON.stringify(files),
    };
  
};
 */

const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

const s3 = new S3Client();

exports.handler = async (event) => {
  const BUCKET_NAME = process.env.UPLOAD_BUCKET;
  try {
    const data = await s3.send(new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: '',
    }));

    const files = data.Contents?.map(obj => ({
      key: obj.Key,
      lastModified: obj.LastModified,
      size: obj.Size,
      url: `https://${BUCKET_NAME}.s3.amazonaws.com/${obj.Key}`,
    }));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://d10uresn4y47do.cloudfront.net',
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET"
      },
      body: JSON.stringify(files),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
