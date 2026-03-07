import os
from flask import Flask, request, send_file, render_template, jsonify
from reports.sales_report import SalesReport
from reports.financial_report import FinancialReport
from reports.inventory_report import InventoryReport

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "output"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

REPORTS = {
	"sales": SalesReport,
	"financial": FinancialReport,
	"inventory": InventoryReport,
}

@app.route("/")
def index():
	return render_template("index.html")

@app.route("/generate", methods=["POST"])
def generate():
	file = request.files.get("file")
	report_type = request.form.get("report_type")

	if not file or not report_type:
		return jsonify({"error": "Missing file or report type."}), 400

	if report_type not in REPORTS:
		return jsonify({"error": f"Unknown report type: {report_type}"}), 400

	input_path = os.path.join(UPLOAD_FOLDER, file.filename)
	output_path = os.path.join(OUTPUT_FOLDER, "report.xlsx")

	file.save(input_path)

	try:
		REPORTS[report_type](input_path).load().generate(output_path)
	except Exception as e:
		return jsonify({"error": str(e)}), 500

	return jsonify({"message": "Report generated successfully."})

@app.route("/download")
def download():
	path = os.path.join(OUTPUT_FOLDER, "report.xlsx")
	if not os.path.exists(path):
		return jsonify({"error": "No report found. Generate one first."}), 404
	return send_file(path, as_attachment=True, download_name="report.xlsx")

if __name__ == "__main__":
	app.run(debug=True)

