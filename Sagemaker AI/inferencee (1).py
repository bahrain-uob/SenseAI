import pandas as pd
import numpy as np
import joblib
import tarfile
import os
from sklearn.ensemble import IsolationForest
import shap

# ─── Paths ───────────────────────────────────────────────────────────────
model_tar_path = "/opt/ml/processing/model/model.tar.gz"
model_extracted_path = "/opt/ml/processing/model"
encoder_file = "/opt/ml/processing/input/encoders/label_encoders.joblib"
input_path = "/opt/ml/processing/input/encoded_final.csv"
output_path = "/opt/ml/processing/output/anomaly_scores.csv"

# ─── Extract Model ───────────────────────────────────────────────────────
if model_tar_path.endswith(".tar.gz"):
    with tarfile.open(model_tar_path, "r:gz") as tar:
        tar.extractall(path=model_extracted_path)

# ─── Find Model File ─────────────────────────────────────────────────────
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
df = pd.read_csv(input_path, low_memory=False)

# ─── Save TransactionID for reference ───────────────────────────────────
transaction_ids = df["TransactionID"]
df_model_input = df.drop(columns=["TransactionID"])
df_model_input = df_model_input.apply(pd.to_numeric, errors="coerce").fillna(-1)

# ─── Inference ───────────────────────────────────────────────────────────
raw_scores = model.decision_function(df_model_input)
scaled_scores = 100 * (raw_scores.max() - raw_scores) / (raw_scores.max() - raw_scores.min())

# ─── SHAP Explanations for 99k Sample (Preserving Sign) ─────────────────
sorted_idx = np.argsort(scaled_scores)
top_idx = sorted_idx[-33000:]
mid_idx = sorted_idx[33000:66000]
low_idx = sorted_idx[:33000]
sample_idx = np.concatenate([top_idx, mid_idx, low_idx])
sample_input = df_model_input.iloc[sample_idx]

explainer = shap.Explainer(model, df_model_input)
shap_values = explainer(sample_input)

# Convert to signed percentage contribution
shap_array = shap_values.values
row_sums = np.sum(np.abs(shap_array), axis=1).reshape(-1, 1) + 1e-8
shap_percent = shap_array / row_sums * 100

# Format into a full dataframe
shap_df_sample = pd.DataFrame(
    shap_percent,
    columns=[f"SHAP_%_{col}" for col in df_model_input.columns],
    index=sample_idx
).round(2)

# Full SHAP DataFrame with zeros for non-sampled rows
shap_df_full = pd.DataFrame(
    0, index=df_model_input.index,
    columns=[f"SHAP_%_{col}" for col in df_model_input.columns]
)
shap_df_full.loc[sample_idx] = shap_df_sample

# ─── Final Output Frame ──────────────────────────────────────────────────
df_output = df.copy()
df_output["AnomalyScore"] = scaled_scores.round(2)
df_output = pd.concat([df_output.reset_index(drop=True), shap_df_full.reset_index(drop=True)], axis=1)

# ─── Decode Categorical Columns for Interpretability ────────────────────
if os.path.exists(encoder_file):
    label_encoders = joblib.load(encoder_file)
    for col, le in label_encoders.items():
        if col in df_output.columns:
            try:
                df_output[col] = le.inverse_transform(df_output[col])
            except:
                print(f"Warning: could not decode column {col}")

# ─── Save Output ─────────────────────────────────────────────────────────
df_output.to_csv(output_path, index=False)

# ─── Print Top 10 Anomalies ──────────────────────────────────────────────
print("\nTop 10 Anomalies by Score:\n")
print(
    df_output.sort_values("AnomalyScore", ascending=False)
             .head(10)
             .loc[:, ["TransactionID", "HSCode", "Commercial Description", "AnomalyScore"]]
             .to_string(index=False)
)