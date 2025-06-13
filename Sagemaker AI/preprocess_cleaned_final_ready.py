# preprocess_cleaned_final_ready.py

import pandas as pd
import numpy as np
import os

# Input/Output file paths for SageMaker Processing
INPUT_PATH = "/opt/ml/processing/input/preprocessed_cleaned_ready.csv"
OUTPUT_PATH = "/opt/ml/processing/output/preprocessed_cleaned_final.csv"

# Columns where any missing rows should be dropped
drop_na_rows = [
    "Commercial Description", "Country of Origin Code", "Country of Origin",
    "Country of Export Code", "Country of Destination Code",
    "Country of Destination", "Invoice Currency"
]

# Columns to drop entirely
columns_to_drop = [
    "Receipt Time", "Office Exit", "Office Exit Name",
    "Assigned Examiner", "First Reroute By"
]

# Fill specific string values
string_fill = {
    "Exporter Name": "IMPORT TRANSACTION",
    "Sup Unit": "NSU",
    "Receipt Serial": "R",
    "Receipt Date": "8/3/2024  10:17:40 AM"
}

# Fill with "#N/A" if missing
fill_na_object = [
    "Consignee Name", "Consignee CR", "Exporter CR", "LOC Name",
    "Exit Serial", "Exit Date", "Exit Time"
]

# Numeric columns to fill with median
fill_median_columns = [
    "Local Amount", "Invoice Amount", "Gross Weight", "Net Weight",
    "Receipt Number", "HS-Rate", "Exit Number", "Exit Office Code",
    "Exit Officer ID", "Local_to_Weight_Ratio"
]

# Columns to fill with 0
zero_fill_columns = [
    "Customs Duty Rate", "Customs Duty BHD",
    "Excise Duty Rate", "Excise Duty BHD",
    "VAT Rate", "VAT BHD",
    "Total Duty BHD", "Fees"
]

# Read dataset
df = pd.read_csv(INPUT_PATH, dtype=str)

# Convert necessary columns to numeric
for col in fill_median_columns + zero_fill_columns + ["Sup Amt"]:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="coerce")

# Drop rows with missing values in key fields
df.dropna(subset=drop_na_rows, inplace=True)

# Drop irrelevant columns
df.drop(columns=[col for col in columns_to_drop if col in df.columns], inplace=True)

# Fill known string values
for col, val in string_fill.items():
    if col in df.columns:
        df[col] = df[col].fillna(val)

# Fill "#N/A"
for col in fill_na_object:
    if col in df.columns:
        df[col] = df[col].fillna("#N/A")

# Fill Sup Amt with logic
if "Sup Amt" in df.columns and "Sup Unit" in df.columns:
    median_sup_amt = df.loc[df["Sup Unit"] != "NSU", "Sup Amt"].median()
    df["Sup Amt"] = df.apply(
        lambda row: 0 if row["Sup Unit"] == "NSU" else row["Sup Amt"],
        axis=1
    )
    df["Sup Amt"] = df["Sup Amt"].fillna(median_sup_amt)

# Fill numeric median columns
for col in fill_median_columns:
    if col in df.columns:
        median_val = df[col].median()
        df[col] = df[col].fillna(median_val)

# Fill 0 where needed
for col in zero_fill_columns:
    if col in df.columns:
        df[col] = df[col].fillna(0)

# Ensure HSCode is properly padded
if "HSCode" in df.columns:
    df["HSCode"] = df["HSCode"].astype(str).str.zfill(8)

# Write output
df.to_csv(OUTPUT_PATH, index=False)
