import boto3
import json

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("TransRawV3")  # Confirm table name if different

def handler(event, context):
    try:
        # Parse incoming body (from frontend or Postman)
        body = json.loads(event.get("body") or "{}")

        # Read pagination inputs
        limit = int(body.get("limit", 20))
        start_key = body.get("startKey")

        # Build scan parameters
        scan_kwargs = {
            "Limit": limit
        }
        if start_key:
            scan_kwargs["ExclusiveStartKey"] = start_key

        # Perform the scan
        response = table.scan(**scan_kwargs)

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "*"
            },
            "body": json.dumps({
                "items": response.get("Items", []),
                "lastEvaluatedKey": response.get("LastEvaluatedKey")
            }, indent=2, default=str)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
