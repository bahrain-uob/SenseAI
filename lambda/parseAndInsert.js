const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const DynamoDB = new AWS.DynamoDB.DocumentClient();
const xlsx = require('xlsx');

exports.handler = async (event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    try {
      // Fetch the file from S3
      const s3Object = await S3.getObject({ Bucket: bucket, Key: key }).promise();

      // Read and parse the Excel file
      const workbook = xlsx.read(s3Object.Body, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      // Insert each row into DynamoDB
      const tableName = process.env.TABLE_NAME;

      for (const row of data) {
        if (!row.INDEX) continue; // Ensure INDEX exists
        await DynamoDB.put({
          TableName: tableName,
          Item: {
            ...row,
            INDEX: row.INDEX.toString(), // Use INDEX as partition key
          },
        }).promise();
      }

      console.log(`Successfully inserted ${data.length} rows from ${key}`);
    } catch (error) {
      console.error(`Error processing ${key}:`, error);
    }
  }
};
