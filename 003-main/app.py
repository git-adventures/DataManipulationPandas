from flask import Flask, request, render_template, jsonify
from migrator.connector import connect
from migrator.migrator import migrate

app = Flask(__name__)

@app.route('/')
def index():
	return render_template('index.html')

@app.route('/migrate', methods=['POST'])
def run_migration():
	data = request.get_json()
	try:
		src_engine = connect(
			db_type=data['src_type'],
			database=data['src_database'],
			host=data.get('src_host', 'localhost'),
			user=data.get('src_user'),
			password=data.get('src_password'),
			port=data.get('src_port'),
		)
		tgt_engine = connect(
			db_type=data['tgt_type'],
			database=data['tgt_database'],
			host=data.get('tgt_host', 'localhost'),
			user=data.get('tgt_user'),
			password=data.get('tgt_password'),
			port=data.get('tgt_port'),
		)
		result = migrate(src_engine, tgt_engine, data['src_type'], data['tgt_type'])
		return jsonify(result)
	except Exception as e:
		return jsonify({'success': False, 'migrated': [], 'failed': str(e)}), 500

if __name__ == '__main__':
	app.run(debug=True)

