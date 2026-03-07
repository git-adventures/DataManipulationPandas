# Maps (source_db, target_db) -> {source_type: target_type}
TYPE_MAP = {
	("sqlite", "postgresql"): {
		"INTEGER": "INTEGER",
		"TEXT": "TEXT",
		"REAL": "DOUBLE PRECISION",
		"BLOB": "BYTEA",
		"NUMERIC": "NUMERIC",
	},
	("sqlite", "mysql"): {
		"INTEGER": "INT",
		"TEXT": "LONGTEXT",
		"REAL": "DOUBLE",
		"BLOB": "LONGBLOB",
		"NUMERIC": "DECIMAL",
	},
	("mysql", "postgresql"): {
		"INT": "INTEGER",
		"TINYINT": "SMALLINT",
		"BIGINT": "BIGINT",
		"VARCHAR": "VARCHAR",
		"TEXT": "TEXT",
		"LONGTEXT": "TEXT",
		"DOUBLE": "DOUBLE PRECISION",
		"DECIMAL": "NUMERIC",
		"DATETIME": "TIMESTAMP",
		"LONGBLOB": "BYTEA",
	},
	("mysql", "sqlite"): {
		"INT": "INTEGER",
		"TINYINT": "INTEGER",
		"BIGINT": "INTEGER",
		"VARCHAR": "TEXT",
		"LONGTEXT": "TEXT",
		"DOUBLE": "REAL",
		"DECIMAL": "NUMERIC",
		"DATETIME": "TEXT",
		"LONGBLOB": "BLOB",
	},
	("postgresql", "sqlite"): {
		"INTEGER": "INTEGER",
		"BIGINT": "INTEGER",
		"SMALLINT": "INTEGER",
		"VARCHAR": "TEXT",
		"TEXT": "TEXT",
		"DOUBLE PRECISION": "REAL",
		"NUMERIC": "NUMERIC",
		"BYTEA": "BLOB",
		"TIMESTAMP": "TEXT",
		"BOOLEAN": "INTEGER",
	},
	("postgresql", "mysql"): {
		"INTEGER": "INT",
		"BIGINT": "BIGINT",
		"SMALLINT": "TINYINT",
		"VARCHAR": "VARCHAR(255)",
		"TEXT": "LONGTEXT",
		"DOUBLE PRECISION": "DOUBLE",
		"NUMERIC": "DECIMAL",
		"BYTEA": "LONGBLOB",
		"TIMESTAMP": "DATETIME",
		"BOOLEAN": "TINYINT",
	},
}

def map_type(src_db, tgt_db, src_type):
	src_db = src_db.lower()
	tgt_db = tgt_db.lower()
	src_type = src_type.upper()
	
	if src_db == tgt_db:
		return src_type

	key = (src_db, tgt_db)
	if key not in TYPE_MAP:
		raise ValueError(f"No type mapping defined for {src_db} -> {tgt_db}")

	return TYPE_MAP[key].get(src_type, "TEXT") # fallback to TEXT if unknown

