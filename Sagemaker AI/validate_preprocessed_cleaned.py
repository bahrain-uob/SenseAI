import pandas as pd
import os
import sys

# ─── Paths ─────────────────────────────────────────────────────────
INPUT_PATH = "/opt/ml/processing/input/preprocessed_cleaned_final_updated.csv"
OUTPUT_PATH = "/opt/ml/processing/output/validation_report.txt"

# ─── Load Dataset ──────────────────────────────────────────────────
df = pd.read_csv(INPUT_PATH, dtype=str)

report = []

# ─── Rule 1: Consignee CR = '1111111-11' where previously missing ──
if "Consignee CR" in df.columns:
    missing_cr_count = df["Consignee CR"].isna().sum()
    incorrect_cr_count = df[df["Consignee CR"] == "1111111-11"].shape[0]
    report.append(f"[Consignee CR] Missing: {missing_cr_count}, Filled with '1111111-11': {incorrect_cr_count}")
else:
    report.append("[Consignee CR] Column not found!")

# ─── Rule 2: Consignee Name = 'does not exist' where missing ───────
if "Consignee Name" in df.columns:
    missing_name_count = df["Consignee Name"].isna().sum()
    filled_name_count = df[df["Consignee Name"] == "does not exist"].shape[0]
    report.append(f"[Consignee Name] Missing: {missing_name_count}, Filled with 'does not exist': {filled_name_count}")
else:
    report.append("[Consignee Name] Column not found!")

# ─── Rule 3: LOC Name must be dropped ──────────────────────────────
if "LOC Name" in df.columns:
    report.append("[LOC Name] ❌ Column still exists — should be dropped!")
else:
    report.append("[LOC Name] ✅ Column successfully dropped.")

# ─── Rule 4: No missing values in Exit Serial / Date / Time ────────
for col in ["Exit Serial", "Exit Date", "Exit Time"]:
    if col in df.columns:
        count = df[col].isna().sum()
        if count > 0:
            report.append(f"[{col}] ❌ {count} missing rows found!")
        else:
            report.append(f"[{col}] ✅ No missing values.")
    else:
        report.append(f"[{col}] ❌ Column not found!")

# ─── Optional: Check HSCode formatting (8 digits) ──────────────────
if "HSCode" in df.columns:
    invalid_hs = df[~df["HSCode"].str.match(r"^\d{8}$")].shape[0]
    report.append(f"[HSCode] Invalid 8-digit format entries: {invalid_hs}")
else:
    report.append("[HSCode] Column not found!")

# ─── Save Validation Report ────────────────────────────────────────
with open(OUTPUT_PATH, "w") as f:
    for line in report:
        print(line)
        f.write(line + "\n")
