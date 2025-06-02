import random
from faker import Faker
from openpyxl import Workbook
from openpyxl.utils import get_column_letter

fake = Faker()

# To track previously used combinations of Reference Number and Item Number
used_combinations = set()

# Function to generate a unique reference number and item number combination
def generate_unique_reference_item():
    while True:
        reference_number = fake.uuid4()  # Unique reference number (UUID)
        item_number = random.randint(1, 10000)  # Random item number

        # Ensure unique combination of Reference Number and Item Number
        combination = (reference_number, item_number)
        if combination not in used_combinations:
            used_combinations.add(combination)
            return reference_number, item_number

# Function to generate a single record
def generate_record(index):
    reference_number, item_number = generate_unique_reference_item()  # Ensure unique combination

    return {
        "INDEX": index + 1,
        "Year": random.choice(range(2000, 2023)),
        "Customs Office Code": fake.bothify(text='?????'),
        "Customs Office Name": fake.company(),
        "Regime": fake.word(),
        "Registration Serial": fake.bothify(text='??????#####'),
        "Registration Number": fake.bothify(text='#####'),
        "Reference Number": reference_number,  # Unique Reference Number
        "Registration Date": fake.date_this_decade(),
        "Registration Time": fake.time(),
        "Declarant CR": fake.random_number(digits=8),
        "Declarant Name": fake.name(),
        "Agent ID": fake.uuid4(),
        "Agent Name": fake.name(),
        "Consignee CR": fake.random_number(digits=8),
        "Consignee Name": fake.name(),
        "Exporter CR": fake.random_number(digits=8),
        "Exporter Name": fake.name(),
        "Receipt Serial": fake.bothify(text='??????#####'),
        "Receipt Number": fake.bothify(text='#####'),
        "Receipt Date": fake.date_this_year(),
        "Receipt Time": fake.time(),
        "Cashier ID": fake.uuid4(),
        "Cashier Name": fake.name(),
        "LOC Code": fake.bothify(text='???'),
        "LOC Name": fake.company(),
        "Terms of delivery": fake.word(),
        "Office Exit": fake.word(),
        "Office Exit Name": fake.company(),
        "Item Number": item_number,  # Unique Item Number for each record
        "Procedure": fake.word(),
        "CP3": fake.bothify(text='#####'),
        "Pref": fake.word(),
        "HSCode": fake.bothify(text='######'),
        "Commercial Description": fake.sentence(),
        "Country of Origin Code": fake.country_code(),
        "Country of Origin": fake.country(),
        "Country of Export Code": fake.country_code(),
        "Country of Export": fake.country(),
        "Country of Destination Code": fake.country_code(),
        "Country of Destination": fake.country(),
        "Invoice Currency": fake.currency_code(),
        "Invoice Amount": fake.random_number(digits=5),
        "Local Currency": fake.currency_code(),
        "Local Amount": fake.random_number(digits=5),
        "Customs Duty Rate": round(random.uniform(0, 1), 2),
        "Customs Duty BHD": fake.random_number(digits=2),
        "Excise Duty Rate": round(random.uniform(0, 1), 2),
        "Excise Duty BHD": fake.random_number(digits=2),
        "VAT Rate": round(random.uniform(0, 1), 2),
        "VAT BHD": fake.random_number(digits=2),
        "Total Duty BHD": fake.random_number(digits=2),
        "HS-Rate": round(random.uniform(0, 1), 2),
        "Fees": fake.random_number(digits=2),
        "Currency": fake.currency_code(),
        "Gross Weight": random.randint(10, 1000),
        "Net Weight": random.randint(10, 1000),
        "Package Code": fake.bothify(text='???'),
        "Package Amt": fake.random_number(digits=3),
        "Sup Unit": fake.bothify(text='???'),
        "Sup Amt": fake.random_number(digits=3),
        "Exit Serial": fake.bothify(text='?????#####'),
        "Exit Number": fake.random_number(digits=5),
        "Exit Date": fake.date_this_year(),
        "Exit Time": fake.time(),
        "Exit Office Code": fake.bothify(text='???'),
        "Exit Officer ID": fake.uuid4(),
        "Exit Officer Name": fake.name(),
        "Status": fake.word(),
        "Assigned Examiner": fake.name(),
        "First Reroute By": fake.name(),
        "Specification Code": fake.bothify(text='#####'),
        "Warehouse Code": fake.bothify(text='#####')
    }

# Number of records to generate
num_records = 1000

# Generate all records
records = [generate_record(i) for i in range(num_records)]

# Create an Excel workbook and worksheet
wb = Workbook()
ws = wb.active
ws.title = "Transactions"

# Add the headers
headers = list(records[0].keys())
ws.append(headers)

# Add the data rows
for record in records:
    ws.append(list(record.values()))

# Adjust column width for better visibility
for col in range(1, len(headers) + 1):
    column_letter = get_column_letter(col)
    max_length = 0
    for row in ws.iter_rows(min_col=col, max_col=col):
        for cell in row:
            try:
                if len(str(cell.value)) > max_length:
                    max_length = len(cell.value)
            except:
                pass
    adjusted_width = (max_length + 2)
    ws.column_dimensions[column_letter].width = adjusted_width

# Save the workbook as an Excel file
excel_file = "transactions.xlsx"
wb.save(excel_file)

print(f"Excel file with {num_records} records generated successfully!")
