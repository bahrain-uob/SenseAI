const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
  try {
    const result = await dynamodb.scan({ TableName: TABLE_NAME }).promise();
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },  // enable CORS
      body: JSON.stringify(result.Items),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
