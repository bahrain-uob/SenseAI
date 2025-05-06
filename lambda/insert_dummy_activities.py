import boto3
import random
from datetime import datetime, timedelta

# Initialize DynamoDB client
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("EmployeeActivity")

# Sample data
employees = ["Ahmed", "Hassan", "Fatima", "Zainab", "Omar", "Salman", "Mariam", "Ali", "Sara", "Khalid"]
actions_sequence = ["Open", "Flag", "Closed"]
transactions = [f"TRX{random.randint(100000, 999999)}" for _ in range(10)]

def generate_unique_activity_logs():
    now = datetime.utcnow()
    activity_logs = []

    print("Generating clean transaction logs...\n")

    for trx_id in transactions:
        # Pick 1 to 3 employees randomly for this transaction
        num_employees = random.randint(1, 3)
        selected_employees = random.sample(employees, num_employees)

        for i, action in enumerate(actions_sequence):
            if i < num_employees:
                employee = selected_employees[i]
            else:
                employee = selected_employees[-1]  # fallback if fewer employees

            # Slight offset to guarantee unique timestamp per employee
            timestamp = now - timedelta(days=random.randint(0, 5), minutes=random.randint(0, 1440), seconds=i)

            log = {
                "EmployeeName": employee,
                "Timestamp": timestamp.isoformat(),
                "Action": action,
                "TransactionID": trx_id
            }

            activity_logs.append(log)
            print(f"{trx_id}: {action} by {employee} at {timestamp.isoformat()}")

    return activity_logs

def insert_batch(logs):
    print("\nUploading to DynamoDB...\n")
    with table.batch_writer() as batch:
        for i, item in enumerate(logs):
            batch.put_item(Item=item)
            print(f"[{i+1}] ✅ {item['EmployeeName']} - {item['Action']} - {item['TransactionID']}")

if __name__ == "__main__":
    logs = generate_unique_activity_logs()
    insert_batch(logs)
    print(f"\n✅ Completed! Inserted {len(logs)} logs into 'EmployeeActivity'.")
