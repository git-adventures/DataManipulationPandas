from flask import Flask, request, render_template, send_file, redirect
from main import CSVCleaner
import os

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        file = request.files.get('file')
        if not file or file.filename == '':
            return redirect('/')
        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        file.save(filepath)
        cleaner = CSVCleaner(filepath)
        cleaner.load()
        cleaner.clean()
        cleaner.detect_outliers()
        cleaner.remove_outliers()
        cleaner.export('cleaned.csv')
        return ('', 204)
    return render_template('index.html')

@app.route('/report')
def report():
    filename = request.args.get('file')
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    cleaner = CSVCleaner(filepath)
    cleaner.load()
    cleaner.inspect()
    cleaner.validate()
    cleaner.clean()
    cleaner.detect_outliers()
    cleaner.export('cleaned.csv')
    return render_template('report.html')

@app.route('/download')
def download():
    return send_file('cleaned.csv', as_attachment=True)

if __name__ == "__main__":
    app.run(debug=True)

