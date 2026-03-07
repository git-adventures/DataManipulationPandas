from sqlalchemy import inspect

def get_schema(engine):
	inspector = inspect(engine)
	tables = inspector.get_table_names()
	schema = {}
	for table in tables:
		columns = inspector.get_columns(table)
		schema[table] = [
			{"name": col["name"], "type": type(col["type"]).__name__}
			for col in columns
		]
	return schema
