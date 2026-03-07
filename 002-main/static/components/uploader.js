export function initUploader({
  formId = 'upload-form',
  fileInputId = 'file-input',
  fileNameId = 'file-name',
  reportTypeId = 'report-type',
  statusId = 'upload-status',
  generateEndpoint = '/generate',
  downloadUrl = '/download',
} = {}) {
  const form = document.getElementById(formId);
  const fileInput = document.getElementById(fileInputId);
  const fileNameEl = document.getElementById(fileNameId);
  const reportType = document.getElementById(reportTypeId);
  const btn = form.querySelector('.btn');
  const status = document.getElementById(statusId);

  fileInput.addEventListener('change', () => {
    const name = fileInput.files[0]?.name || '';
    fileNameEl.textContent = name;
    status.textContent = '';
    status.className = '';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!reportType.value) {
      status.textContent = 'Please select a report type.';
      status.className = 'status error';
      return;
    }

    if (!fileInput.files[0]) {
      status.textContent = 'Please select a CSV file.';
      status.className = 'status error';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Generating...';
    status.textContent = '';
    status.className = '';

    try {
      const data = new FormData();
      data.append('file', fileInput.files[0]);
      data.append('report_type', reportType.value);

      const res = await fetch(generateEndpoint, { method: 'POST', body: data });
      const json = await res.json();

      if (res.ok) {
        status.textContent = 'Report ready!';
        status.className = 'status success';
        btn.textContent = 'Download Report';
        btn.onclick = () => window.location.href = downloadUrl;
      } else {
        throw new Error(json.error || 'Server error');
      }
    } catch (err) {
      status.textContent = err.message || 'Something went wrong.';
      status.className = 'status error';
      btn.textContent = 'Generate Report';
    }

    btn.disabled = false;
  });
}
