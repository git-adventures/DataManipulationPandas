import argparse
from migrator.connector import connect, test_connection
from migrator.migrator import migrate

def parse_db_args(prefix, args):
	return {
		"db_type": getattr(args, f"{prefix}_type"),
		"database": getattr(args, f"{prefix}_database"),
		"host": getattr(args, f"{prefix}_host"),
		"user": getattr(args, f"{prefix}_user"),
		"password": getattr(args, f"{prefix}_password"),
		"port": getattr(args, f"{prefix}_port"),
	}

def main():
	parser = argparse.ArgumentParser(description="Database Migration Tool")

	for prefix in ("src", "tgt"):
		parser.add_argument(f"--{prefix}-type", required=True, help="sqlite | postgresql | mysql")
		parser.add_argument(f"--{prefix}-database", required=True, help="Database name or file path")
		parser.add_argument(f"--{prefix}-host", default="localhost")
		parser.add_argument(f"--{prefix}-user", default=None)
		parser.add_argument(f"--{prefix}-password", default=None)
		parser.add_argument(f"--{prefix}-port", default=None, type=int)

	parser.add_argument("--chunksize", type=int, default=1000)

	args = parser.parse_args()

	src_args = parse_db_args("src", args)
	tgt_args = parse_db_args("tgt", args)

	src_engine = connect(**{k: v for k, v in src_args.items() if k != "db_type"},
		db_type=src_args["db_type"])
	tgt_engine = connect(**{k: v for k, v in tgt_args.items() if k != "db_type"},
		db_type=tgt_args["db_type"])

	print("Testing connections...")
	test_connection(src_engine)
	test_connection(tgt_engine)

	migrate(src_engine, tgt_engine,
		src_args["db_type"], tgt_args["db_type"],
		chunksize=args.chunksize)

if __name__ == "__main__":
	main()
