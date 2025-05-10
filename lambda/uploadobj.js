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

  const allowedOrigins = ['http://localhost', 'http://localhost:3000'];
  const requestOrigin = event.headers.origin;

  const responseHeaders = {
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  };

  if (allowedOrigins.includes(requestOrigin)) {
    responseHeaders["Access-Control-Allow-Origin"] = requestOrigin;
  }

  return {
    statusCode: 200,
    headers: responseHeaders,
    body: JSON.stringify({ uploadUrl: signedUrl }),
  };
};
