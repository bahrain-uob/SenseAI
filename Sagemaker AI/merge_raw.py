script_code = """
import boto3
import pandas as pd
import io
import os

# ─── CONFIG ─────────────────────────────────────────────
BUCKET      = 'sagemakerstack-transactionsrawdatabucket6643d2da-q7nfqsc3jpnn'
PREFIX      = '.csv/'
S3_KEY      = 'merged/cleaned_merged_raw.csv'
OUTPUT_FILE = 'cleaned_merged_raw.csv'  # Local file in notebook
EXPECTED_COLUMNS = 73
CHUNK_SIZE = 100_000

# ─── CLEAN START ────────────────────────────────────────
if os.path.exists(OUTPUT_FILE):
    os.remove(OUTPUT_FILE)

# ─── Column definitions ────────────────────────────────
string_cols = [
    'INDEX','Customs Office Code','Customs Office Name','Regime','Registration Serial',
    'Registration Number','Reference Number','Registration Date','Registration Time',
    'Declarant CR','Declarant Name','Agent ID','Agent Name','Consignee CR','Consignee Name',
    'Exporter CR','Exporter Name','Receipt Serial','Receipt Date','Receipt Time','Cashier ID',
    'Cashier Name','LOC Code','LOC Name','Terms of delivery','Office Exit','Office Exit Name',
    'Item Number','Procedure','CP3','Pref','HSCode','Commercial Description',
    'Country of Origin Code','Country of Origin','Country of Export Code','Country of Export',
    'Country of Destination Code','Country of Destination','Invoice Currency','Local Currency',
    'Currency','Package Code','Sup Unit','Exit Serial','Exit Number','Exit Date','Exit Time',
    'Exit Office Code','Exit Officer ID','Exit Officer Name','Status','Assigned Examiner',
    'First Reroute By','Specification Code','Warehouse Code'
]
dtype_map = { col: "string" for col in string_cols }

numeric_cols = [
    'Year','Invoice Amount','Local Amount','Gross Weight','Net Weight','Customs Duty Rate',
    'Customs Duty BHD','Excise Duty Rate','Excise Duty BHD','VAT Rate','VAT BHD','Total Duty BHD',
    'HS-Rate','Fees','Package Amt','Sup Amt'
]

# ─── Stream from S3 and merge ───────────────────────────
s3 = boto3.client('s3')
paginator = s3.get_paginator('list_objects_v2').paginate(Bucket=BUCKET, Prefix=PREFIX)

first_chunk = True
total_written = 0

for page in paginator:
    for obj in page.get('Contents', []):
        key = obj['Key']
        if not key.lower().endswith('.csv'):
            continue
        print(f"⏳ Processing {key}")
        body = s3.get_object(Bucket=BUCKET, Key=key)['Body']

        for chunk in pd.read_csv(io.TextIOWrapper(body, encoding='utf-8'),
                                 chunksize=CHUNK_SIZE,
                                 dtype=dtype_map,
                                 low_memory=False,
                                 on_bad_lines='skip'):
            # Drop rows with invalid column counts
            valid_chunk = chunk.loc[chunk.apply(lambda row: len(row) == EXPECTED_COLUMNS, axis=1)]

            # Coerce numerics
            for col in numeric_cols:
                if col in valid_chunk.columns:
                    valid_chunk[col] = pd.to_numeric(valid_chunk[col], errors='coerce')

            # Append to output
            valid_chunk.to_csv(
                OUTPUT_FILE,
                mode='a',
                header=first_chunk,
                index=False
            )
            total_written += len(valid_chunk)
            first_chunk = False

print(f"✅ Merging complete. {total_written:,} valid rows written.")
"""

with open("merge_cleaned.py", "w") as f:
    f.write(script_code.strip())

print("✅ Script saved as merge_cleaned.py")
!python merge_cleaned.py