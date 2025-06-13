# encode_dataset.py

import pandas as pd
import os
from sklearn.preprocessing import LabelEncoder
import joblib

INPUT_FILE = "/opt/ml/processing/input/preprocessed_cleaned_final_updated.csv"
OUTPUT_FILE = "/opt/ml/processing/output/encoded_final.csv"
ENCODER_DIR = "/opt/ml/processing/encoders"

# Read data
df = pd.read_csv(INPUT_FILE)

# Store TransactionID to preserve later
transaction_ids = df["TransactionID"]
df = df.drop(columns=["TransactionID"])

# Encode categorical columns
label_encoders = {}
for col in df.select_dtypes(include="object").columns:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))
    label_encoders[col] = le

# Reinsert TransactionID as first column
df.insert(0, "TransactionID", transaction_ids)

# Save encoded data
df.to_csv(OUTPUT_FILE, index=False)

# Save encoders
os.makedirs(ENCODER_DIR, exist_ok=True)
joblib.dump(label_encoders, os.path.join(ENCODER_DIR, "label_encoders.joblib"))
