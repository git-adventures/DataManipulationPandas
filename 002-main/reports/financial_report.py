import pandas as pd
from reports.base_report import BaseReport

class FinancialReport(BaseReport):
	def load(self):
		self.df = pd.read_csv(self.filepath, parse_dates=["date"])
		self.df["month"] = self.df["date"].dt.to_period("M").astype(str)
		return self

	def generate(self, output_path: str):
		if self.df is None:
			raise RuntimeError("Call load() before generate()")

		with pd.ExcelWriter(output_path, engine="xlsxwriter") as writer:
			self._write_summary(writer)
			self._write_monthly(writer)
			self.df.to_excel(writer, sheet_name="Raw Data", index=False)

		print(f"Report written to {output_path}")

	def _write_summary(self, writer):
		income = self.df[self.df["type"] == "income"]["amount"].sum()
		expense = self.df[self.df["type"] == "expense"]["amount"].sum()
		summary = pd.DataFrame({
			"Category": ["Total Income", "Total Expenses", "Net Profit"],
			"Amount": [income, expense, income - expense]
		})
		summary.to_excel(writer, sheet_name="Summary", index=False)

		wb = writer.book
		ws = writer.sheets["Summary"]
		red = wb.add_format({"bg_color": "#FFC7CE", "font_color": "#9C0006"})
		green = wb.add_format({"bg_color": "#C6EFCE", "font_color": "#276221"})
		ws.conditional_format("B4:B4", {"type": "cell", "criteria": "<", "value": 0, "format": red})
		ws.conditional_format("B4:B4", {"type": "cell", "criteria": ">", "value": 0, "format": green})

	def _write_monthly(self, writer):
		pivot = pd.pivot_table(
			self.df, values="amount",
			index="month", columns="type", aggfunc="sum", fill_value=0
		)
		pivot["net"] = pivot.get("income", 0) - pivot.get("expense", 0)
		pivot.to_excel(writer, sheet_name="Monthly Breakdown")

