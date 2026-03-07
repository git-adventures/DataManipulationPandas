import pandas as pd
from reports.pivot import sales_by_region_product, sales_by_month, profit_margin_by_product

def write_sales_report(df: pd.DataFrame, output_path: str):
	with pd.ExcelWriter(output_path, engine="xlsxwriter") as writer:
		pivot1 = sales_by_region_product(df)
		pivot2 = sales_by_month(df)
		pivot3 = profit_margin_by_product(df)

		pivot1.to_excel(writer, sheet_name="By Region & Product")
		pivot2.to_excel(writer, sheet_name="By Month")
		pivot3.to_excel(writer, sheet_name="Profit Margin")
		df.to_excel(writer, sheet_name="Raw Data", index=False)

		wb = writer.book

		_format_region_product(writer, wb, pivot1)
		_format_profit_margin(writer, wb, pivot3)
		_add_monthly_chart(writer, wb, pivot2)

	print(f"Report written to {output_path}")

def _format_region_product(writer, wb, pivot):
	ws = writer.sheets["By Region & Product"]
	rows, cols = pivot.shape

	green = wb.add_format({"bg_color": "#C6EFCE", "font_color": "#276221"})
	red = wb.add_format({"bg_color": "#FFC7CE", "font_color": "#9C0006"})

	# Green: cells above 3000
	ws.conditional_format(1, 1, rows, cols, {
		"type": "cell",
		"criteria": ">",
		"value": 3000,
		"format": green
	})

	# Red: zero cells
	ws.conditional_format(1, 1, rows, cols, {
		"type": "cell",
		"criteria": "==",
		"value": 0,
		"format": red
	})

def _format_profit_margin(writer, wb, pivot):
	ws = writer.sheets["Profit Margin"]
	rows, cols = pivot.shape

	orange = wb.add_format({"bg_color": "#FFEB9C", "font_color": "#9C5700"})

	# Orange: margin below 50%
	ws.conditional_format(1, 3, rows, 3, {
		"type": "cell",
		"criteria": "<",
		"value": 50,
		"format": orange
	})

def _add_monthly_chart(writer, wb, pivot):
	ws = writer.sheets["By Month"]
	rows = len(pivot)

	chart = wb.add_chart({"type": "column"})

	# Revenue series - column B (index 1), rows 1 to rows+1
	chart.add_series({
		"name": "Revenue",
		"categories": ["By Month", 1, 0, rows, 0],
		"values": ["By Month", 1, 2, rows, 2],
		"fill": {"color": "#4472C4"}
	})

	# Profit series - column A (index 0)
	chart.add_series({
		"name": "Profit",
		"categories": ["By Month", 1, 0, rows, 0],
		"values": ["By Month", 1, 1, rows, 1],
		"fill": {"color": "#ED7D31"}
	})

	chart.set_title({"name": "Monthly Revenue vs Profit"})
	chart.set_x_axis({"name": "Month"})
	chart.set_y_axis({"name": "Amount ($)"})
	chart.set_size({"width": 480, "height": 300})

	ws.insert_chart("D2", chart)
