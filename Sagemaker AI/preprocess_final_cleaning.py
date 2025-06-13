import pandas as pd
import numpy as np

# ─── File Paths ─────────────────────────────────────────────────────
INPUT_FILE = "/opt/ml/processing/input/preprocessed_cleaned.csv"
OUTPUT_FILE = "/opt/ml/processing/output/preprocessed_cleaned_ready.csv"

# ─── Columns to Drop (>95% Missing) ────────────────────────────────
cols_to_drop = [
    "Agent Name", "Cashier ID", "Pref", "Exit Officer Name"
]

# ─── Fill with "#N/A" (Categorical fields with intentional blanks) ─
object_fill_na = [
    "Exporter Name", "Assigned Examiner", "First Reroute By",
    "Consignee Name", "Consignee CR", "Exporter CR",
    "Receipt Serial", "Receipt Date", "Receipt Time",
    "LOC Name", "Office Exit Name", "Exit Serial", "Exit Date", "Exit Time",
    "Sup Unit"
]

# ─── Fill with Median (Numeric fields with meaningful values) ──────
numeric_fill_median = [
    "Local Amount", "Invoice Amount", "Gross Weight", "Net Weight",
    "Receipt Number", "HS-Rate", "Exit Number", "Exit Office Code",
    "Exit Officer ID", "Local_to_Weight_Ratio"
]

# ─── Fill with Zero (Rate fields that imply absence when blank) ────
rate_cols_zero_fill = [
    "Customs Duty Rate", "Customs Duty BHD",
    "Excise Duty Rate", "Excise Duty BHD",
    "VAT Rate", "VAT BHD",
    "Total Duty BHD", "Fees"
]

# ─── Read File ──────────────────────────────────────────────────────
df = pd.read_csv(INPUT_FILE, low_memory=False)

# ─── Drop High Missing Columns ─────────────────────────────────────
df.drop(columns=[col for col in cols_to_drop if col in df.columns], inplace=True)

# ─── Fill Object Columns with "#N/A" ───────────────────────────────
for col in object_fill_na:
    if col in df.columns:
        df[col] = df[col].fillna("#N/A")

# ─── Convert Numeric Columns Before Filling Median ─────────────────
for col in numeric_fill_median:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="coerce")
        median_val = df[col].median()
        df[col] = df[col].fillna(median_val)

# ─── Special Case: Sup Amt Handling ────────────────────────────────
if "Sup Amt" in df.columns and "Sup Unit" in df.columns:
    df["Sup Amt"] = pd.to_numeric(df["Sup Amt"], errors="coerce")
    df["Sup Amt"] = df.apply(
        lambda row: 0 if row["Sup Unit"] == "#N/A" else row["Sup Amt"],
        axis=1
    )
    median_sup_amt = df.loc[df["Sup Unit"] != "#N/A", "Sup Amt"].median()
    df["Sup Amt"] = df["Sup Amt"].fillna(median_sup_amt)

# ─── Fill Duty & Fee Columns with 0 ────────────────────────────────
for col in rate_cols_zero_fill:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

# ─── Ensure HSCode is Padded Correctly ─────────────────────────────
if "HSCode" in df.columns:
    df["HSCode"] = df["HSCode"].astype(str).str.zfill(8)

# ─── Save Final Output ─────────────────────────────────────────────
df.to_csv(OUTPUT_FILE, index=False)
