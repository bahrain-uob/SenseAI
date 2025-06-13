import pandas as pd
import numpy as np
import joblib
import os

# 🔁 Paths that match your current processing input mount points
encoded_with_scores_path = "/opt/ml/processing/input/anomaly_scores/anomaly_scores.csv"
label_encoders_path = "/opt/ml/processing/input/label_encoders/label_encoders.joblib"
raw_path = "/opt/ml/processing/input/raw/cleaned_merged_raw.csv"  # ⛔ Missing in current job, see below
output_path = "/opt/ml/processing/output/decoded_flagged_transactions.csv"

# Load encoded dataset with scores
df_encoded = pd.read_csv(encoded_with_scores_path)

# Load encoders
label_encoders = joblib.load(label_encoders_path)

# Reverse fillna (-1 → NaN)
df_encoded.replace(-1, np.nan, inplace=True)

# Decode only known encoded columns
for col, le in label_encoders.items():
    if col in df_encoded.columns:
        try:
            df_encoded[col] = le.inverse_transform(df_encoded[col].astype(int))
        except Exception as e:
            print(f"[WARN] Could not decode column '{col}': {e}")

# Save decoded version with scores
df_encoded.to_csv(output_path, index=False)
print(f"✅ Saved decoded version to {output_path}")
