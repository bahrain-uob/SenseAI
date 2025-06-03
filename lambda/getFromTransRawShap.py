import boto3
import json
import os
from boto3.dynamodb.conditions import Attr

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ['TABLE_NAME'])

def handler(event, context):
    try:
        # Parse incoming body
        body = json.loads(event.get("body") or "{}")

        reference = body.get("referenceNumber")
        item = body.get("itemNumber")

        # If both reference and item number are provided, do a direct lookup
        if reference and item:
            response = table.get_item(
                Key={
                    "Reference Number": reference,
                    "Item Number": item
                }
            )

            item = response.get("Item")
            if item:
                return {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Origin": "http://localhost:3000",
                        "Access-Control-Allow-Headers": "*",
                        "Access-Control-Allow-Methods": "*"
                    },
                    "body": json.dumps({"item": item}, indent=2, default=str)
                }
            else:
                return {
                    "statusCode": 404,
                    "body": json.dumps({"error": "Transaction not found"})
                }

        # Otherwise, fallback to scan (filtered list view)
        limit = int(body.get("limit", 50))
        start_key = body.get("startKey")
        hs_code = body.get("hsCode")
        from_date = body.get("fromDate")
        to_date = body.get("toDate")
        risk_level = body.get("riskLevel")

        filters = []

        if hs_code:
            filters.append(Attr("HSCode").contains(hs_code))
        if from_date and to_date:
            filters.append(Attr("Registration Date").between(from_date, to_date))
        if risk_level == "Critical":
            filters.append(Attr("AnomalyScore").gte(90))
        elif risk_level == "High":
            filters.append(Attr("AnomalyScore").between(70, 89.9))
        elif risk_level == "Medium":
            filters.append(Attr("AnomalyScore").between(40, 69.9))
        elif risk_level == "Low":
            filters.append(Attr("AnomalyScore").lt(40))

        scan_kwargs = {"Limit": limit}
        if start_key:
            scan_kwargs["ExclusiveStartKey"] = start_key
        if filters:
            from functools import reduce
            scan_kwargs["FilterExpression"] = reduce(lambda x, y: x & y, filters)

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
        print("❌ Error:", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
