from tqdm import tqdm

class MigrationTracker:
	def __init__(self, tables):
		self.completed = [] # tables successfully migrated
		self.failed = None # table that failed
		self.progress = tqdm(total=len(tables), desc="Migrating tables", unit="table")

	def mark_done(self, table):
		self.completed.append(table)
		self.progress.update(1)

	def mark_failed(self, table, error):
		self.failed = table
		self.progress.close()
		print(f"\n[FAILED] Table '{table}': {error}")

	def rollback(self, engine):
		if not self.completed:
			print("Nothing to roll back.")
			return
		print(f"\nRolling back {len(self.completed)} table(s)...")
		with engine.connect() as conn:
			for table in reversed(self.completed):
				conn.execute(__import__('sqlalchemy').text(f'DROP TABLE IF EXISTS "{table}"'))
				print(f" Dropped: {table}")
			conn.commit()
		print("Rollback complete.")

	def close(self):
		self.progress.close()

