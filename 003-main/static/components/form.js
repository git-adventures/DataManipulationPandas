export function initForm() {
  const form   = document.getElementById('migrate-form');
  const btn    = form.querySelector('.btn');
  const status = document.getElementById('form-status');
  const panel  = document.getElementById('result-panel');
  const title  = document.getElementById('result-title');
  const body   = document.getElementById('result-body');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const payload = {
      src_type:     fd.get('src_type'),
      src_database: fd.get('src_database'),
      src_host:     fd.get('src_host') || 'localhost',
      src_user:     fd.get('src_user') || null,
      src_password: fd.get('src_password') || null,
      tgt_type:     fd.get('tgt_type'),
      tgt_database: fd.get('tgt_database'),
      tgt_host:     fd.get('tgt_host') || 'localhost',
      tgt_user:     fd.get('tgt_user') || null,
      tgt_password: fd.get('tgt_password') || null,
    };

    btn.disabled = true;
    btn.textContent = 'Migrating...';
    status.textContent = '';
    status.className = '';
    panel.classList.remove('open', 'error');

    try {
      const res  = await fetch('/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        title.textContent = `Migration complete — ${data.migrated.length} table(s)`;

        let html = '';

        // Tables section
        html += `<div class="result-section">`;
        html += `<div class="result-section-title">${payload.src_type} → ${payload.tgt_type}</div>`;
        for (const table of data.migrated) {
          const cols = data.schema[table] || [];
          html += `<div class="result-table-card">
            <div>
              <div class="result-table-name">${table}</div>
              <div class="result-schema">${cols.map(c => `${c.name}(${c.type})`).join(' · ')}</div>
            </div>
            <div class="result-table-rows">${data.row_counts[table]} rows ✓</div>
          </div>`;
        }
        html += `</div>`;

        // Type conversions
        const allMappings = {};
        for (const mappings of Object.values(data.type_mappings)) {
          for (const [from, to] of Object.entries(mappings)) {
            allMappings[from] = to;
          }
        }
        if (Object.keys(allMappings).length > 0) {
          html += `<div class="result-section">`;
          html += `<div class="result-section-title">Type conversions applied</div>`;
          for (const [from, to] of Object.entries(allMappings)) {
            html += `<span class="result-conversion">${from} → ${to}</span>`;
          }
          html += `</div>`;
        } else {
          html += `<div class="result-section">`;
          html += `<div class="result-section-title">Type conversions</div>`;
          html += `<span class="result-conversion">none — same DB type</span>`;
          html += `</div>`;
        }

        body.innerHTML = html;
        panel.classList.add('open');

      } else {
        title.textContent = `Migration failed`;
        panel.classList.add('open', 'error');

        let html = `<div class="result-section">`;
        html += `<div class="result-section-title">${payload.src_type} → ${payload.tgt_type}</div>`;
        html += `<div class="result-error-box">${data.failed}</div>`;
        html += `</div>`;

        if (data.migrated && data.migrated.length > 0) {
          html += `<div class="result-section">`;
          html += `<div class="result-section-title">Rolled back tables</div>`;
          for (const table of data.migrated) {
            html += `<div class="result-table-card error-card">
              <div class="result-table-name">${table}</div>
              <div class="result-table-rows error-rows">dropped ✕</div>
            </div>`;
          }
          html += `</div>`;
        } else {
          html += `<div class="result-section">`;
          html += `<div class="result-section-title">Rollback</div>`;
          html += `<span class="result-conversion">nothing to roll back</span>`;
          html += `</div>`;
        }

        body.innerHTML = html;
      }
    } catch {
      title.textContent = 'Connection error';
      panel.classList.add('open', 'error');
      body.innerHTML = `
        <div class="result-section">
          <div class="result-error-box">Could not reach the server or connect to the database.<br>Check your host, credentials, and that the DB server is running.</div>
        </div>`;
    }

    btn.disabled = false;
    btn.textContent = 'Run Migration';
  });
}
