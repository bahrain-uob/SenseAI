# generate_explanations.py

import pandas as pd
import numpy as np
import os

# ─── Paths ─────────────────────────────────────────────────────
anomaly_scores_path = "/opt/ml/processing/input/anomaly_scores.csv"
hscode_reference_path = "/opt/ml/processing/input/cleaned_hscode.csv"
output_path = "/opt/ml/processing/output/explanations.csv"

# ─── Load Datasets ──────────────────────────────────────────────
df = pd.read_csv(anomaly_scores_path, low_memory=False)
hscode_ref = pd.read_csv(hscode_reference_path, dtype=str)

# ─── Normalize Columns ──────────────────────────────────────────
df["HSCode"] = df["HSCode"].astype(str).str.zfill(8)
hscode_ref["HSCode"] = hscode_ref["HSCode"].astype(str).str.zfill(8)

# ─── Merge for Description Comparison ───────────────────────────
merged = df.merge(hscode_ref, on="HSCode", how="left")

def generate_reason(row):
    reasons = []

    # 1. Check Description Mismatch
    cd = str(row.get("Commercial Description", "")).lower()
    eng_desc = str(row.get("English_Description", "")).lower()
    ar_desc = str(row.get("Arabic_Description", "")).lower()

    if pd.notna(eng_desc) and eng_desc not in cd:
        reasons.append("Mismatch with English HS description")
    if pd.notna(ar_desc) and ar_desc not in cd:
        reasons.append("Mismatch with Arabic HS description")

    # 2. Check Local-to-Weight Ratio
    ratio = row.get("Local_to_Weight_Ratio", 0)
    if isinstance(ratio, (float, int)):
        if ratio > 1000:
            reasons.append("Unusually high value-to-weight ratio")
        elif ratio < 0.01:
            reasons.append("Unusually low value-to-weight ratio")

    # 3. High anomaly score
    score = row.get("AnomalyScore", 0)
    if score > 85:
        reasons.append("Top 15% anomaly score")

    return "; ".join(reasons) if reasons else "No significant anomaly indicators"

# ─── Generate Explanations ──────────────────────────────────────
merged["AnomalyExplanation"] = merged.apply(generate_reason, axis=1)

# ─── Output Results ─────────────────────────────────────────────
merged.to_csv(output_path, index=False)