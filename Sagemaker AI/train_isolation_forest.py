# train_isolation_forest.py

import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
import os

# ─── Configurations ───────────────────────────────────────────────
INPUT_PATH = "/opt/ml/input/data/training/encoded_final.csv"
OUTPUT_DATA_PATH = "/opt/ml/output/data/anomaly_scores.csv"
MODEL_OUTPUT_PATH = "/opt/ml/model/isolation_forest_model.joblib"

N_ESTIMATORS = 100
CONTAMINATION = 'auto'
RANDOM_STATE = 42

# ─── Load Dataset ─────────────────────────────────────────────────
print(f"📥 Loading dataset from: {INPUT_PATH}")
df = pd.read_csv(INPUT_PATH, low_memory=False)

# ─── Extract and drop TransactionID for modeling ─────────────────
transaction_ids = df["TransactionID"] if "TransactionID" in df.columns else None
df = df.drop(columns=["TransactionID"], errors='ignore')

# ─── Cleanup ──────────────────────────────────────────────────────
df = df.dropna(axis=1, how='all')  # Drop fully empty columns
low_variance_cols = df.columns[df.nunique() <= 1]
print(f"⚠ Low variance columns (not dropped): {list(low_variance_cols)}")

df = df.apply(pd.to_numeric, errors='coerce').fillna(-1)

# ─── Train Model ──────────────────────────────────────────────────
print(" Training Isolation Forest...")
model = IsolationForest(
    n_estimators=N_ESTIMATORS,
    contamination=CONTAMINATION,
    random_state=RANDOM_STATE,
    n_jobs=-1
)
model.fit(df)

# ─── Score and Scale ──────────────────────────────────────────────
print(" Generating anomaly scores...")
raw_scores = model.decision_function(df)
scaled_scores = 100 * (raw_scores.max() - raw_scores) / (raw_scores.max() - raw_scores.min())
df["AnomalyScore"] = scaled_scores.round(2)

# ─── Attach TransactionID back ────────────────────────────────────
if transaction_ids is not None:
    df["TransactionID"] = transaction_ids
    df = df[["TransactionID", "AnomalyScore"]]

# ─── Save Outputs ────────────────────────────────────────────────
print(f" Saving results to: {OUTPUT_DATA_PATH}")
df.to_csv(OUTPUT_DATA_PATH, index=False)

print(f" Saving model to: {MODEL_OUTPUT_PATH}")
joblib.dump(model, MODEL_OUTPUT_PATH)

# ─── Summary ─────────────────────────────────────────────────────
print(" Training complete.")
print(f" Mean Anomaly Score: {df['AnomalyScore'].mean():.2f}")
print(" Top 5 Outliers:")
print(df.sort_values(by="AnomalyScore", ascending=False).head())
