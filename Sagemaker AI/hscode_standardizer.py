import pandas as pd

# Input/output paths inside the processing container
input_path = "/opt/ml/processing/input/encoded_final.csv"
output_path = "/opt/ml/processing/output/encoded_final.csv"

# Load dataset with HSCode as string
df = pd.read_csv(input_path, dtype={"HSCode": str})

# Clean HSCode
df['HSCode'] = df['HSCode'].str.strip()                        # Remove spaces
df['HSCode_8'] = df['HSCode']                                  # Preserve raw 8-digit format
df['HSCode'] = df['HSCode'].str.zfill(12)                      # Pad to 12-digit future-proof format

# Save updated version
df.to_csv(output_path, index=False)