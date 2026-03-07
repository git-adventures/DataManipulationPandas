from data.loader import DataLoader
from reports.excel_writer import write_sales_report
from reports.base_report import BaseReport

class SalesReport(BaseReport):
	def load(self):
		self.df = DataLoader(self.filepath).load()
		return self

	def generate(self, output_path: str):
		if self.df is None:
			raise RuntimeError("Call load() before generate()")
		write_sales_report(self.df, output_path)

