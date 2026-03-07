import sys
import re
import pandas as pd

class CSVCleaner:
    def __init__(self, filepath):
        self.filepath = filepath
        self.df = None

    def load(self):
        self.df = pd.read_csv(self.filepath)
        self.df.columns = self.df.columns.str.strip()

    def inspect(self):
        print("--- Data Overview ---")
        print(f"Rows: {self.df.shape[0]}, Columns: {self.df.shape[1]}")

        print("--- Column Types ---")
        print(self.df.dtypes)

        print("--- Missing Values ---")
        print(self.df.isnull().sum())

        print("--- Duplicate Rows ---")
        print(f"{self.df.duplicated().sum()} duplicate(s) found.")

    def clean(self, strategy='drop'):
        print("--- Cleaning ---")
        before = len(self.df)
        self.df = self.df.drop_duplicates()
        removed = before - len(self.df)
        print(f"Removed {removed} duplicate(s)")

        if strategy == 'mean':
            num_cols = self.df.select_dtypes(include='number').columns
            self.df[num_cols] = self.df[num_cols].fillna(self.df[num_cols].mean())
        elif strategy == 'median':
            num_cols = self.df.select_dtypes(include='number').columns
            self.df[num_cols] = self.df[num_cols].fillna(self.df[num_cols].median())
        else:
            self.df = self.df.dropna()

    def validate(self):
        print("--- Validation ---")
        for col in self.df.columns:

            before = self.df[col].isnull().sum()
            converted = pd.to_numeric(self.df[col], errors='coerce')
            after = converted.isnull().sum()

            if converted.isnull().all():
                continue
            bad = after - before

            if bad > 0:
                print(f"Column '{col}': {bad} invalid value(s) found.")

            if 'email' in col.lower():
                pattern = re.compile(r'^[\w\.-]+@[\w\.-]+\.\w+$')
                bad = self.df[col].dropna().apply(lambda x: not bool(pattern.match(str(x)))).sum()
                if bad > 0:
                    print(f"Columnn '{col}' : {bad} invalid email(s)")

    def detect_outliers(self):
        for col in self.df.select_dtypes(include="number").columns:
            Q1 = self.df[col].quantile(0.25)
            Q3 = self.df[col].quantile(0.75)
            IQR = Q3 - Q1
            outliers = self.df[(self.df[col] < Q1 - 1.5*IQR) | (self.df[col] > Q3 + 1.5*IQR)]
            print(f"Column '{col}' : {len(outliers)} outlier(s)")

    def export(self, output_path="cleaned.csv"):
        self.df.to_csv(output_path, index=False)
        print(f"Saved to {output_path}")

    def remove_outliers(self):
        before = len(self.df)
        for col in self.df.select_dtypes(include='number').columns:
            Q1 = self.df[col].quantile(0.25)
            Q3 = self.df[col].quantile(0.75)
            IQR = Q3 - Q1
            self.df = self.df[(self.df[col] >= Q1 - 1.5*IQR) & (self.df[col] <= Q3 + 1.5*IQR)]
        print(f"Removed {before - len(self.df)} outlier row(s). Remaining: {len(self.df)}")

if __name__ == "__main__":
    filepath = sys.argv[1] if len(sys.argv) > 1 else "sample.csv"
    cleaner = CSVCleaner(filepath)
    cleaner.load()
    cleaner.inspect()
    cleaner.validate()
    cleaner.clean()
    cleaner.detect_outliers()
    cleaner.remove_outliers()
    cleaner.export()