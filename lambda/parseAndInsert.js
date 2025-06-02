/* const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const DynamoDB = new AWS.DynamoDB.DocumentClient();
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const os = require('os');

exports.handler = async (event) => {
  console.log("🔍 Received event:", JSON.stringify(event, null, 2));

  if (!event.Records || event.Records.length === 0) {
    console.warn("⚠️ No S3 records found in event.");
    return;
  }
  const table2 = process.env.RAW_V2_TABLE;
  const table3 =process.env.RAW_V3_TABLE;

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    console.log(`📥 Processing file: ${key} from bucket: ${bucket}`);

    try {
      const s3Object = await S3.getObject({ Bucket: bucket, Key: key }).promise();
      console.log(`📦 Fetched object. Size: ${s3Object.ContentLength} bytes`);

      const wb = xlsx.read(s3Object.Body, { type: 'buffer' });
      const sheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);
      console.log(`📊 Extracted ${data.length} rows from sheet: ${sheetName}`);

      // 📌 Write data to DynamoDB in chunks
      const ROW_CHUNK_SIZE = 4000;
      const BATCH_SIZE = 25;
      let totalInserted = 0;

      for (let i = 0; i < data.length; i += ROW_CHUNK_SIZE) {
        const chunk = data.slice(i, i + ROW_CHUNK_SIZE);

        const batches = [];
        for (let j = 0; j < chunk.length; j += BATCH_SIZE) {
          const batch = chunk
            .slice(j, j + BATCH_SIZE)
            .filter(r => r.rowid)
            .map(r => ({
              PutRequest: {
                Item: {
                  ...r,
                  rowid: r.rowid.toString()
                }
              }
            }));
          if (batch.length) batches.push(batch);
        }

        for (const batch of batches) {
          for (const tbl of [table2,table3]) {
            try {
              const res = await DynamoDB.batchWrite({ RequestItems: { [tbl]: batch } }).promise();
              const unprocessed = res.UnprocessedItems?.[tbl]?.length || 0;
              const processed = batch.length - unprocessed;
              totalInserted += processed;
              if (unprocessed) {
                console.warn(`⚠️ ${unprocessed} unprocessed items in ${tbl}`);
              }
            } catch (err) {
              console.error(`❌ Error writing batch to ${tbl}:`, err);
            }
          }
        }

        console.log(`✅ Processed chunk of ${chunk.length} records`);
      }

      console.log(`✅ All done. Total inserted : ${totalInserted}`);

    } catch (err) {
      console.error(`❌ Error processing file ${key}:`, err);
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

  const table3 = process.env.RAW_V3_TABLE;

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    console.log(`📥 Processing file: ${key} from bucket: ${bucket}`);

    try {
      const s3Object = await S3.getObject({ Bucket: bucket, Key: key }).promise();
      console.log(`📦 Fetched object. Size: ${s3Object.ContentLength} bytes`);

      const wb = xlsx.read(s3Object.Body, { type: 'buffer' });
      const sheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);
      console.log(`📊 Extracted ${data.length} rows from sheet: ${sheetName}`);

      const ROW_CHUNK_SIZE = 4000;
      const BATCH_SIZE = 25;
      let totalInserted = 0;

      for (let i = 0; i < data.length; i += ROW_CHUNK_SIZE) {
        const chunk = data.slice(i, i + ROW_CHUNK_SIZE);

        const batches = [];
        for (let j = 0; j < chunk.length; j += BATCH_SIZE) {
          const batch = chunk.slice(j, j + BATCH_SIZE)
            .filter(r => r["Reference Number"] && r["Item Number"])
            .map(r => ({
              PutRequest: {
                Item: {
                  ...r,
                  "Reference Number": r["Reference Number"].toString(),
                  "Item Number": r["Item Number"].toString()
                }
              }
            }));

          if (batch.length) batches.push(batch);
        }

        for (const batch of batches) {
          try {
            const res = await DynamoDB.batchWrite({ RequestItems: { [table3]: batch } }).promise();
            const unprocessed = res.UnprocessedItems?.[table3]?.length || 0;
            const processed = batch.length - unprocessed;
            totalInserted += processed;

            if (unprocessed > 0) {
              console.warn(`⚠️ ${unprocessed} unprocessed items in ${table3}`);
            }
          } catch (err) {
            console.error(`❌ Error writing batch to ${table3}:`, err);
          }
        }

        console.log(`✅ Chunk of ${chunk.length} processed`);
      }

      console.log(`✅ All done. Total inserted: ${totalInserted}`);
    } catch (err) {
      console.error(`❌ Error processing file ${key}:`, err);
    }
  }
};
