import pandas as pd
import os

# ─── Paths ───────────────────────────────────────────────────────────────
input_path = "/opt/ml/processing/input/anomaly_scores.csv"
output_path = "/opt/ml/processing/output/shap_rows_only.csv"

# ─── Load Dataset ────────────────────────────────────────────────────────
df = pd.read_csv(input_path, low_memory=False)

# ─── Identify SHAP Columns ───────────────────────────────────────────────
shap_cols = [col for col in df.columns if col.startswith("SHAP_")]

# ─── Filter Rows Where Any SHAP Column Has Non-Zero ──────────────────────
df_shap = df[df[shap_cols].abs().sum(axis=1) > 0]

# ─── Save Result ─────────────────────────────────────────────────────────
df_shap.to_csv(output_path, index=False)
print(f"✅ Extracted {len(df_shap)} rows with SHAP values.")