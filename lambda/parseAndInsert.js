/* const AWS = require('aws-sdk');
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
 */
/* const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const DynamoDB = new AWS.DynamoDB.DocumentClient();
const xlsx = require('xlsx');

exports.handler = async (event) => {
  console.log("🔍 Received event:", JSON.stringify(event, null, 2));

  if (!event.Records || event.Records.length === 0) {
    console.warn("⚠️ No S3 records found in event. Nothing to process.");
    return;
  }

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    console.log(`📥 Processing file: ${key} from bucket: ${bucket}`);

    try {
      const s3Object = await S3.getObject({ Bucket: bucket, Key: key }).promise();
      console.log(`📦 Fetched object from S3. Size: ${s3Object.ContentLength} bytes`);

      const workbook = xlsx.read(s3Object.Body, { type: 'buffer' });
      console.log(`📄 Parsed Excel file. Sheets available: ${workbook.SheetNames}`);

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);
      console.log(`📊 Extracted ${data.length} rows from sheet: ${sheetName}`);

      const tableName = process.env.TABLE_NAME;
      let insertedCount = 0;

      for (const [i, row] of data.entries()) {
        if (!row.INDEX) {
          console.warn(`⏩ Skipping row ${i + 1} — missing INDEX:`, row);
          continue;
        }

        const item = {
          ...row,
          INDEX: row.INDEX.toString(),
        };

        console.log(`🔄 Inserting row ${i + 1}:`, item);

        await DynamoDB.put({
          TableName: tableName,
          Item: item,
        }).promise();

        insertedCount++;
      }

      console.log(`✅ Finished. Inserted ${insertedCount} rows into DynamoDB from ${key}`);
    } catch (error) {
      console.error(`❌ Error processing file: ${key} —`, error);
    }
  }
};
 */

const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const DynamoDB = new AWS.DynamoDB.DocumentClient();
const xlsx = require('xlsx');

exports.handler = async (event) => {
  console.log("🔍 Received event:", JSON.stringify(event, null, 2));

  if (!event.Records || event.Records.length === 0) {
    console.warn("⚠️ No S3 records found in event.");
    return;
  }

  // grab both env vars
  const table1 = process.env.RAW_TABLE;
  const table2 = process.env.RAW_V2_TABLE;

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key    = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    console.log(`📥 Processing file: ${key} from bucket: ${bucket}`);

    try {
      const s3Object = await S3.getObject({ Bucket: bucket, Key: key }).promise();
      console.log(`📦 Fetched object. Size: ${s3Object.ContentLength} bytes`);

      const wb = xlsx.read(s3Object.Body, { type: 'buffer' });
      const sheetName = wb.SheetNames[0];
      const data      = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);
      console.log(`📊 Extracted ${data.length} rows from sheet: ${sheetName}`);

      // break into batches of 25
      const BATCH_SIZE = 25;
      const batches = [];
      for (let i = 0; i < data.length; i += BATCH_SIZE) {
        const slice = data
          .slice(i, i + BATCH_SIZE)
          .filter(r => r.rowid)
          .map(r => ({
            PutRequest: {
              Item: {
                ...r,
                rowid: r.rowid.toString()
              }
            }
          }));
        if (slice.length) batches.push(slice);
      }

      let totalInserted = 0;
      // write each batch to each table
      for (const batch of batches) {
        for (const tbl of [table1, table2]) {
          const params = { RequestItems: { [tbl]: batch } };
          try {
            const res = await DynamoDB.batchWrite(params).promise();
            const unprocessed = res.UnprocessedItems?.[tbl]?.length || 0;
            const processed = batch.length - unprocessed;
            totalInserted += processed;
            if (unprocessed) {
              console.warn(`⚠️ ${unprocessed} unprocessed in ${tbl}`);
            }
          } catch (err) {
            console.error(`❌ Error writing to ${tbl}:`, err);
          }
        }
      }

      console.log(`✅ All done. Total rows inserted across both tables: ${totalInserted}`);
    } catch (err) {
      console.error(`❌ Error processing ${key}:`, err);
    }
  }
};

