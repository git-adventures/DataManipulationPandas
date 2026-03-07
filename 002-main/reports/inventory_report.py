import pandas as pd
from reports.base_report import BaseReport

class InventoryReport(BaseReport):
	def load(self):
		self.df = pd.read_csv(self.filepath)
		self.df["stock_value"] = self.df["stock"] * self.df["unit_cost"]
		self.df["needs_reorder"] = self.df["stock"] <= self.df["reorder_level"]
		return self

	def generate(self, output_path: str):
		if self.df is None:
			raise RuntimeError("Call load() before generate()")

		with pd.ExcelWriter(output_path, engine="xlsxwriter") as writer:
			self.df.to_excel(writer, sheet_name="Inventory", index=False)
			self._write_category_summary(writer)
			self._highlight_reorder(writer)

		print(f"Report written to {output_path}")

	def _write_category_summary(self, writer):
		summary = self.df.groupby("category").agg(
			total_items=("product", "count"),
			total_stock_value=("stock_value", "sum")
		)
		summary.to_excel(writer, sheet_name="By Category")

	def _highlight_reorder(self, writer):
		wb = writer.book
		ws = writer.sheets["Inventory"]
		rows = len(self.df)
		red = wb.add_format({"bg_color": "#FFC7CE", "font_color": "#9C0006"})
		ws.conditional_format(1, 0, rows, 5, {
			"type": "formula",
			"criteria": "=$C2<=$D2",
			"format": red
		})

