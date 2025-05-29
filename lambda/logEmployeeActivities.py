import json
import boto3
import os
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['ACTIVITY_TABLE_NAME'])

def handler(event, context):
    try:
        body = json.loads(event['body'])
        print("Received body:", body)

        item = {
            'TransactionID': body.get('TransactionID', 'unknown'),
            'EmployeeName': body.get('EmployeeName', 'unknown'),
            'Action': body.get('Action', 'view'),
            'Timestamp': body.get('Timestamp', datetime.utcnow().isoformat())
        }

        table.put_item(Item=item)

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",  
                "Access-Control-Allow-Headers": "*", 
                "Access-Control-Allow-Methods": "*", 
                "Content-Type": "application/json"   
            },
            "body": json.dumps({"message": "Activity logged successfully"})
        }

    except Exception as e:
        print("Error:", str(e))
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "*",
                "Content-Type": "application/json"
            },
            "body": json.dumps({"error": str(e)})
        }
