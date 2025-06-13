# inference_with_shap_sample.py

import subprocess
subprocess.check_call(["pip", "install", "shap"])

import pandas as pd
import numpy as np
import joblib
import tarfile
import os
import shap
from sklearn.ensemble import IsolationForest

# ─── Paths ───────────────────────────────────────────────────────────────
model_tar_path = "/opt/ml/processing/model/model.tar.gz"
model_extracted_path = "/opt/ml/processing/model"
encoder_file = "/opt/ml/processing/input/encoders/label_encoders.joblib"
input_path = "/opt/ml/processing/input/encoded_final.csv"
output_path = "/opt/ml/processing/output/anomaly_scores_sample.csv"

# ─── Extract Model ───────────────────────────────────────────────────────
if model_tar_path.endswith(".tar.gz"):
    with tarfile.open(model_tar_path, "r:gz") as tar:
        tar.extractall(path=model_extracted_path)

model_file = None
for root, dirs, files in os.walk(model_extracted_path):
    for f in files:
        if f.endswith(".joblib"):
            model_file = os.path.join(root, f)
            break
if not model_file:
    raise FileNotFoundError("No .joblib model file found inside model directory")

# ─── Load Model and Data ─────────────────────────────────────────────────
model = joblib.load(model_file)
df = pd.read_csv(input_path, nrows=100, low_memory=False)

transaction_ids = df["TransactionID"]
df_model_input = df.drop(columns=["TransactionID"])
df_model_input = df_model_input.apply(pd.to_numeric, errors="coerce").fillna(-1)

# ─── Inference ───────────────────────────────────────────────────────────
raw_scores = model.decision_function(df_model_input)
scaled_scores = 100 * (raw_scores.max() - raw_scores) / (raw_scores.max() - raw_scores.min())

df_output = df.copy()
df_output["AnomalyScore"] = scaled_scores.round(2)

# ─── Decode Labels ───────────────────────────────────────────────────────
if os.path.exists(encoder_file):
    label_encoders = joblib.load(encoder_file)
    for col, le in label_encoders.items():
        if col in df_output.columns:
            try:
                df_output[col] = le.inverse_transform(df_output[col])
            except:
                print(f"Warning: Could not decode column {col}")

# ─── SHAP Explanation ────────────────────────────────────────────────────
explainer = shap.Explainer(model, df_model_input)
shap_values = explainer(df_model_input)
shap_df = pd.DataFrame(shap_values.values, columns=[f"SHAP_{col}" for col in df_model_input.columns])
df_output = pd.concat([df_output.reset_index(drop=True), shap_df.reset_index(drop=True)], axis=1)

# ─── Save Output ─────────────────────────────────────────────────────────
df_output.to_csv(output_path, index=False)

# ─── Print Sample ────────────────────────────────────────────────────────
print("✅ Top 5 Anomalies with SHAP Values:")
print(df_output.sort_values("AnomalyScore", ascending=False)[["TransactionID", "HSCode", "AnomalyScore"] + list(shap_df.columns)].head(5).to_string(index=False))