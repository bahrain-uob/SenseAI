  //created for testing by ALI so that user can upload any file type

  const AWS = require("aws-sdk");
  const s3 = new AWS.S3();

  exports.handler = async (event) => {
    const fileName = `transaction-${Date.now()}.json`;
    const fileType = event.queryStringParameters?.type || "application/json";

    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: fileName,
      Expires: 600,
      ContentType: fileType,
    };

    const uploadUrl = s3.getSignedUrl("putObject", params);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost", // <-- No array
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
          "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS"

      },
      body: JSON.stringify({ uploadUrl }),
    };
  };