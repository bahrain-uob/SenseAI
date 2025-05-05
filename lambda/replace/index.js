const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const { type, month, year } = event.queryStringParameters;
  const bucket = process.env.BUCKET_NAME;

  // Convert month to 2-digit string (e.g., 3 → "03")
  const paddedMonth = String(parseInt(month) + 1).padStart(2, '0');
  const prefix = `${year}-${paddedMonth}-upload`;

  console.log("Received replace request for:", { year, month, paddedMonth, prefix });

  try {
    // Step 1: List existing files matching the prefix
    const listed = await s3.listObjectsV2({
      Bucket: bucket,
      Prefix: prefix
    }).promise();

    if (listed.Contents.length > 0) {
      console.log(`Found ${listed.Contents.length} files:`, listed.Contents.map(obj => obj.Key));

      const deleteParams = {
        Bucket: bucket,
        Delete: {
          Objects: listed.Contents.map(obj => ({ Key: obj.Key }))
        }
      };

      await s3.deleteObjects(deleteParams).promise();
      console.log(`✅ Deleted old file(s) for ${prefix}`);
    } else {
      console.log(`⚠️ No existing files found for prefix: ${prefix}`);
    }
  } catch (err) {
    console.error('❌ Deletion failed:', err.message);
  }

  // Step 2: Generate signed upload URL
  const fileExtension = type.split('/')[1] || 'file';
  const key = `${prefix}-${Date.now()}.${fileExtension}`;

  const uploadUrl = s3.getSignedUrl('putObject', {
    Bucket: bucket,
    Key: key,
    ContentType: type,
    Expires: 300
  });

  console.log("Generated signed URL for:", key);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': '*'
    },
    body: JSON.stringify({ uploadUrl })
  };
};


