import pandas as pd

def sales_by_region_product(df: pd.DataFrame) -> pd.DataFrame:
	return pd.pivot_table(
		df,
		values="revenue",
		index="region",
		columns="product",
		aggfunc="sum",
		fill_value=0
	)

def sales_by_month(df: pd.DataFrame) -> pd.DataFrame:
		return pd.pivot_table(
			df,
			values=["revenue", "profit"],
			index="month",
			aggfunc="sum",
		)

def profit_margin_by_product(df: pd.DataFrame) -> pd.DataFrame:
		summary = df.groupby("product").agg(
			total_revenue=("revenue", "sum"),
			total_profit=("profit", "sum")
		)
		summary["margin_%"] = (summary["total_profit"] / summary["total_revenue"] * 100).round(2)
		return summary
