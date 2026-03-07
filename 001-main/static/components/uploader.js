export function initUploader() {
  const form = document.getElementById('upload-form');
  const fileInput = document.getElementById('file-input');
  const fileNameEl = document.getElementById('file-name');
  const btn = form.querySelector('.btn');
  const status = document.getElementById('upload-status');

  fileInput.addEventListener('change', () => {
    const name = fileInput.files[0]?.name || '';
    fileNameEl.textContent = name;
    status.textContent = '';
    status.className = '';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!fileInput.files[0]) {
      status.textContent = 'Please select a CSV file first.';
      status.className = 'status error';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Cleaning...';
    status.textContent = '';
    status.className = '';

    try {
      const data = new FormData(form);
      const res = await fetch('/', { method: 'POST', body: data });

      if (res.ok || res.status === 204) {
        status.textContent = 'Done! File cleaned successfully.';
        status.className = 'status success';
        btn.textContent = 'Download Cleaned CSV';
        btn.onclick = () => window.location.href = '/download';
      } else {
        throw new Error('Server error');
      }
    } catch {
      status.textContent = 'Something went wrong. Try again.';
      status.className = 'status error';
      btn.textContent = 'Upload & Clean';
    }

    btn.disabled = false;
  });
}
