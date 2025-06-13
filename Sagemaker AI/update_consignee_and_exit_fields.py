# update_consignee_and_exit_fields.py

import pandas as pd
import os

# ─── File Paths ─────────────────────────────────────────────────────
INPUT_PATH = "/opt/ml/processing/input/preprocessed_cleaned_final.csv"
OUTPUT_PATH = "/opt/ml/processing/output/preprocessed_cleaned_final_updated.csv"

# ─── Load Data ──────────────────────────────────────────────────────
df = pd.read_csv(INPUT_PATH, dtype=str)

# ─── Fill Consignee Fields ──────────────────────────────────────────
df["Consignee CR"] = df["Consignee CR"].fillna("1111111-11")
df["Consignee Name"] = df["Consignee Name"].fillna("does not exist")

# ─── Drop LOC Name Column ───────────────────────────────────────────
if "LOC Name" in df.columns:
    df.drop(columns=["LOC Name"], inplace=True)

# ─── Drop Rows with Missing Exit Serial/Date/Time ───────────────────
drop_exit_fields = ["Exit Serial", "Exit Date", "Exit Time"]
df.dropna(subset=drop_exit_fields, inplace=True)

# ─── Save Output ────────────────────────────────────────────────────
df.to_csv(OUTPUT_PATH, index=False)
