import boto3

# Initialize DynamoDB client
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("EmployeeActivity")

def delete_all_items():
    print("Scanning for existing items...")
    response = table.scan()
    items = response.get("Items", [])

    while "LastEvaluatedKey" in response:
        response = table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
        items.extend(response.get("Items", []))

    print(f"Found {len(items)} items to delete...")

    count = 0
    with table.batch_writer() as batch:
        for item in items:
            batch.delete_item(
                Key={
                    "EmployeeName": item["EmployeeName"],
                    "Timestamp": item["Timestamp"]
                }
            )
            count += 1
            print(f"[{count}] Deleted: {item['EmployeeName']} at {item['Timestamp']}")

    print(f"\n✅ Done. Deleted {count} items from EmployeeActivity.")

if __name__ == "__main__":
    delete_all_items()
