from sqlalchemy import create_engine, text

DIALECTS = {
	"sqlite": "sqlite",
	"postgresql": "postgresql+psycopg2",
	"mysql": "mysql+pymysql",
}

def connect(db_type, **kwargs):
	db_type = db_type.lower()
	if db_type not in DIALECTS:
		raise ValueError(f"Unsupported db type: {db_type}. Choose from {list(DIALECTS)}")

	dialect = DIALECTS[db_type]

	if db_type == "sqlite":
		url = f"{dialect}:///{kwargs['database']}"
	else:
		default_port = 5432 if db_type == 'postgresql' else 3306
		port = kwargs.get('port') or default_port
		url = (
			f"{dialect}://{kwargs['user']}:{kwargs['password']}"
			f"@{kwargs['host']}:{port}"
			f"/{kwargs['database']}"
		)

	engine = create_engine(url)
	return engine

def test_connection(engine):
	with engine.connect() as conn:
		conn.execute(text("SELECT 1"))
	print(f"Connected: {engine.url}")
