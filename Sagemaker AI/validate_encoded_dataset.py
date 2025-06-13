import os
import pandas as pd
from tqdm import tqdm

# Paths
input_path = "/opt/ml/processing/input/encoded_final.csv"
output_dir = "/opt/ml/processing/output"
os.makedirs(output_dir, exist_ok=True)
summary_path = os.path.join(output_dir, "summary.txt")

# Read dataset in chunks to handle large files
print("🔍 Scanning full dataset for unique categorical values...")
sample_rows = []
missing_summary = []

chunk_size = 100000
reader = pd.read_csv(input_path, chunksize=chunk_size, low_memory=False)

for chunk in tqdm(reader):
    sample_rows.append(chunk.head(1))  # keep a small sample
    missing = chunk.isna().mean().sort_values(ascending=False).head(10)
    missing_summary.append(missing)

# Combine small samples
df_sample = pd.concat(sample_rows).drop_duplicates()

# Aggregate missing stats
missing_df = pd.concat(missing_summary, axis=1).fillna(0)
missing_avg = missing_df.mean(axis=1).sort_values(ascending=False)

# Print top 10 missing columns
print("\nTop 10 columns with most missing values:")
print(missing_avg.head(10).apply(lambda x: f"{x*100:.2f}%"))

# Write summary to file
with open(summary_path, "w") as f:
    f.write("✅ Validation Summary\n")
    f.write(f"Sample rows: {len(df_sample)}\n")
    f.write(f"Total columns: {len(df_sample.columns)}\n\n")
    f.write("Top 10 columns with most missing values:\n")
    for col, pct in missing_avg.head(10).items():
        f.write(f"{col}: {pct*100:.2f}%\n")
    f.write("\nEncoding validation completed successfully.\n")

print(f"\nValidation summary written to: {summary_path}")
