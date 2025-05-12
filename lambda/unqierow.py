import pandas as pd

# Load the existing Excel file
file_path = r'D:\last semes\AWS\2019_01_01 to 2019_01_31.xlsx'
df = pd.read_excel(file_path)

# Add a 'rowid' column with unique values
df.insert(0, 'rowid', range(1, len(df) + 1))

# Save the modified Excel file
df.to_excel(r'D:\last semes\M2019_01_01 to 2019_01_31.xlsx', index=False)

