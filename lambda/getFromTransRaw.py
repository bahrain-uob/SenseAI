""" import boto3
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
 """



import boto3
import json
import os
from boto3.dynamodb.conditions import Attr, Key

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ['TABLE_NAME'])

def handler(event, context):
    try:
        body = json.loads(event.get("body") or "{}")

        limit = int(body.get("limit", 50))
        start_key = body.get("startKey")
        hs_code = body.get("hsCode")
        from_date = body.get("fromDate")
        to_date = body.get("toDate")
        risk_level = body.get("riskLevel")
        reference_number = body.get("referenceNumber")
        item_number = body.get("itemNumber")  # optional

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

        # Use Query if reference_number is provided (faster)
        if reference_number:
            query_kwargs = {
                "IndexName": "ReferenceItemIndex",
                "KeyConditionExpression": Key("Reference Number").eq(reference_number),
                "Limit": limit,
            }

            if item_number:
                query_kwargs["KeyConditionExpression"] &= Key("Item Number").eq(item_number)

            if start_key:
                query_kwargs["ExclusiveStartKey"] = start_key

            if filters:
                from functools import reduce
                filter_expression = reduce(lambda x, y: x & y, filters)
                query_kwargs["FilterExpression"] = filter_expression

            response = table.query(**query_kwargs)

        else:
            # Fallback to full table scan
            scan_kwargs = {"Limit": limit}

            if start_key:
                scan_kwargs["ExclusiveStartKey"] = start_key

            if filters:
                from functools import reduce
                filter_expression = reduce(lambda x, y: x & y, filters)
                scan_kwargs["FilterExpression"] = filter_expression

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





""" import boto3
import json
import os
from boto3.dynamodb.conditions import Attr

dynamodb = boto3.resource("dynamodb")

table = dynamodb.Table(os.environ['TABLE_NAME'])

def handler(event, context):
    try:
        # Parse incoming body
        body = json.loads(event.get("body") or "{}")

        limit = int(body.get("limit", 50))
        start_key = body.get("startKey")
        hs_code = body.get("hsCode")
        from_date = body.get("fromDate")
        to_date = body.get("toDate")
        risk_level = body.get("riskLevel")

        # Build Scan filters
        filters = []

        if hs_code:
            filters.append(Attr("HSCode").contains(hs_code))

        if from_date and to_date:
            filters.append(
                Attr("Registration Date").between(from_date, to_date)
            )

     
        if risk_level == "Critical":
            filters.append(Attr("AnomalyScore").gte(90))
        elif risk_level == "High":
            filters.append(Attr("AnomalyScore").between(70, 89.9))
        elif risk_level == "Medium":
            filters.append(Attr("AnomalyScore").between(40, 69.9))
        elif risk_level == "Low":
            filters.append(Attr("AnomalyScore").lt(40))


        scan_kwargs = {
            "Limit": limit
        }

        if start_key:
            scan_kwargs["ExclusiveStartKey"] = start_key

        if filters:
            from functools import reduce
            filter_expression = reduce(lambda x, y: x & y, filters)
            scan_kwargs["FilterExpression"] = filter_expression

        # Perform scan
        response = table.scan(**scan_kwargs)

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "http://localhost:3000",  # You can restrict it
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
        } """
 

""" import boto3
import json
import os
from boto3.dynamodb.conditions import Attr

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ['TABLE_NAME'])

def handler(event, context):
    try:
        # Parse incoming body
        body = json.loads(event.get("body") or "{}")

        limit = int(body.get("limit", 50))
        start_key = body.get("startKey")
        hs_code = body.get("hsCode")
        from_date = body.get("fromDate")
        to_date = body.get("toDate")
        risk_level = body.get("riskLevel")

        # Build Scan filters
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

        # Only return the fields you need
         projection = (
            "Reference Number, Item Number, HSCode, AnomalyScore, "
            "#regDate, Net Weight, Local Amount, rowid"
        ) 

        # Note: If attribute name has a space, use ExpressionAttributeNames
        scan_kwargs = {
            "Limit": limit,
            "ProjectionExpression": "#ref, #item, HSCode, AnomalyScore, #regDate, Net Weight, Local Amount, rowid",
                    "ExpressionAttributeNames": {
                        "#ref": "Reference Number",
                        "#item": "Item Number",
                        "#regDate": "Registration Date"
                    }
        }

        if start_key:
            scan_kwargs["ExclusiveStartKey"] = start_key

        if filters:
            from functools import reduce
            filter_expression = reduce(lambda x, y: x & y, filters)
            scan_kwargs["FilterExpression"] = filter_expression

        # Perform scan
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
        } """
