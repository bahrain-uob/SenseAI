const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({ region: process.env.AWS_REGION });

exports.handler = async function (event) {
  const bucket = process.env.BUCKET_NAME;
  const fileType = event.queryStringParameters?.type || 'image/png';
  const fileName = `upload-${Date.now()}.${fileType.split('/')[1]}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: fileName,
    ContentType: fileType,
  });

  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "https://d10uresn4y47do.cloudfront.net",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET, POST,PUT, OPTIONS" 
    },
    body: JSON.stringify({ uploadUrl: signedUrl }),
  };
};
