import boto3
import random
from datetime import datetime, timedelta
import uuid

# Initialize DynamoDB client
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("EmployeeActivity")

# Sample data
employees = ["Ahmed", "Hassan", "Fatima", "Zainab", "Omar", "Salman", "Mariam", "Ali", "Sara", "Khalid"]
actions = ["Edit", "Open", "Flag", "Closed"]
transactions = [f"TRX{random.randint(100000,999999)}" for _ in range(50)]

# Generate dummy entries
def generate_dummy_activity():
    now = datetime.utcnow()
    activity_logs = []

    for _ in range(30):
        employee = random.choice(employees)
        action = random.choice(actions)
        transaction_id = random.choice(transactions)
        timestamp = now - timedelta(minutes=random.randint(0, 1440))

        activity_logs.append({
            "employee": employee,
            "timestamp": timestamp.isoformat(),
            "action": action,
            "transactionId": transaction_id
        })

    return activity_logs

# Insert into DynamoDB
def insert_batch(logs):
    with table.batch_writer() as batch:
        for item in logs:
            batch.put_item(Item=item)

if __name__ == "__main__":
    logs = generate_dummy_activity()
    insert_batch(logs)
    print(f"Inserted {len(logs)} dummy activity logs.")
