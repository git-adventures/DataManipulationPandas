import sys
from reports.sales_report import SalesReport
from reports.financial_report import FinancialReport
from reports.inventory_report import InventoryReport

REPORTS = {
	"sales": SalesReport,
	"financial": FinancialReport,
	"inventory": InventoryReport,
}

def main():
	if len(sys.argv) != 4:
		print("Usage: python main.py <report_type> <input_file> <output_file>")
		print(f" report_type: {', '.join(REPORTS.keys())}")
		sys.exit(1)

	report_type = sys.argv[1]
	input_file = sys.argv[2]
	output_file = sys.argv[3]

	if report_type not in REPORTS:
		print(f"Unknown report type: {report_type}")
		sys.exit(1)
	
	REPORTS[report_type](input_file).load().generate(output_file)

if __name__ == "__main__":
	main()
