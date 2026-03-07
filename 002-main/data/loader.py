import pandas as pd

class DataLoader:
	def __init__(self, filepath: str):
		self.filepath = filepath
		self.df = None

	def load(self) -> pd.DataFrame:
		self.df = pd.read_csv(self.filepath, parse_dates=["date"])
		self._validate()
		self._normalize()
		return self.df

	def _validate(self):
		required = {"date", "region", "product", "units_sold", "unit_price", "cost"}
		missing = required - set(self.df.columns)
		if missing:
			raise ValueError(f"Missing columns: {missing}")

	def _normalize(self):
		self.df["revenue"] = self.df["units_sold"] * self.df["unit_price"]
		self.df["profit"] = self.df["revenue"] - (self.df["units_sold"] * self.df["cost"])
		self.df["month"] = self.df["date"].dt.to_period("M").astype(str)

