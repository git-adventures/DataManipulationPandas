import pandas as pd
from sqlalchemy import text
from migrator.inspector import get_schema
from migrator.mapper import map_type
from migrator.tracker import MigrationTracker

def create_table(conn, table, columns, src_db, tgt_db):
	col_defs = []
	for col in columns:
		mapped = map_type(src_db, tgt_db, col["type"])
		col_defs.append(f'"{col["name"]}" {mapped}')
	ddl = f'CREATE TABLE IF NOT EXISTS "{table}" ({", ".join(col_defs)})'
	conn.execute(text(ddl))	

def migrate(src_engine, tgt_engine, src_db, tgt_db, chunksize=1000):
	schema = get_schema(src_engine)
	tables = list(schema.keys())

	if not tables:
		print("No tables found in source database.")
		return {"success": False, "migrated": [], "failed": "No tables found", "schema": {}, "type_mappings": {}, "row_counts": {}}

	tracker = MigrationTracker(tables)
	type_mappings = {}
	row_counts = {}

	try:
		with tgt_engine.connect() as tgt_conn:
			for table in tables:
				try:
					table_mappings = {}
					for col in schema[table]:
						mapped = map_type(src_db, tgt_db, col["type"])
						if col["type"] != mapped:
							table_mappings[col["type"]] = mapped
					type_mappings[table] = table_mappings

					create_table(tgt_conn, table, schema[table], src_db, tgt_db)
					tgt_conn.commit()

					total_rows = 0
					chunks = pd.read_sql_table(table, src_engine, chunksize=chunksize)
					for chunk in chunks:
						chunk.to_sql(table, tgt_engine, if_exists="append", index=False)
						total_rows += len(chunk)

					row_counts[table] = total_rows
					tracker.mark_done(table)

				except Exception as e:
					tracker.mark_failed(table, e)
					tracker.rollback(tgt_engine)
					return {"success": False, "migrated": tracker.completed, "failed": str(e), "schema": schema, "type_mappings": type_mappings, "row_counts": row_counts}

	finally:
		tracker.close()

	print(f"\nMigration complete. {len(tracker.completed)} table(s) migrated.")
	return {"success": True, "migrated": tracker.completed, "failed": None, "schema": schema, "type_mappings": type_mappings, "row_counts": row_counts}

