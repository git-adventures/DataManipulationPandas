export function initTerminal({
  inputId = 'terminal-input',
  outputId = 'terminal-output',
  fileInputId = 'file-input',
  fileNameId = 'file-name',
  reportTypeId = 'report-type',
  rightSelector = '.right',
  generateEndpoint = '/generate',
  downloadUrl = '/download',
} = {}) {
  const input = document.getElementById(inputId);
  const output = document.getElementById(outputId);
  const fileInput = document.getElementById(fileInputId);
  const reportTypeEl = document.getElementById(reportTypeId);

  let selectedFile = null;
  let reportReady = false;

  function print(line) {
    const span = document.createElement('span');
    span.className = 'line';
    span.innerHTML = line;
    output.appendChild(span);
    output.scrollTop = output.scrollHeight;
  }

  const commands = {
    help: () => [
      '<span class="green">Available commands:</span>',
      '  <span class="purple">upload</span>                  — pick a CSV file',
      '  <span class="purple">generate &lt;type&gt;</span>       — sales | financial | inventory',
      '  <span class="purple">download</span>                — download the generated report',
      '  <span class="purple">clear</span>                   — clear the terminal',
    ],

    upload: () => {
      fileInput.click();
      fileInput.addEventListener('change', () => {
        selectedFile = fileInput.files[0] || null;
        reportReady = false;
        if (selectedFile) {
          document.getElementById(fileNameId).textContent = selectedFile.name;
          print(`<span class="green">ready:</span> ${selectedFile.name}`);
          print(`<span class="gray">tip: type "generate sales" (or financial / inventory)</span>`);
        }
      }, { once: true });
      return ['<span class="yellow">opening file picker...</span>'];
    },

    generate: async (args) => {
      if (!selectedFile) {
        print('<span class="red">no file loaded. run "upload" first.</span>');
        return;
      }

      const type = args.trim();
      const valid = ['sales', 'financial', 'inventory'];
      if (!valid.includes(type)) {
        print(`<span class="red">unknown type "${type}". use: sales, financial, inventory</span>`);
        return;
      }

      reportTypeEl.value = type;
      input.disabled = true;

      const steps = [
        `<span class="yellow">loading ${selectedFile.name}...</span>`,
        `<span class="gray">validating columns...</span>`,
        `<span class="gray">computing pivot tables...</span>`,
        `<span class="gray">applying conditional formatting...</span>`,
        `<span class="gray">generating charts...</span>`,
        `<span class="yellow">writing Excel file...</span>`,
      ];

      const bar = document.createElement('span');
      bar.className = 'line';
      output.appendChild(bar);

      let filled = 0;
      const total = 20;

      steps.forEach((msg, i) => {
        setTimeout(() => print(msg), i * 300);
      });

      const barInterval = setInterval(() => {
        filled++;
        const done = '#'.repeat(filled);
        const empty = '-'.repeat(total - filled);
        bar.innerHTML = `<span class="green">[${done}${empty}] ${Math.round((filled / total) * 100)}%</span>`;
        output.scrollTop = output.scrollHeight;

        if (filled >= total) {
          clearInterval(barInterval);

          const data = new FormData();
          data.append('file', selectedFile);
          data.append('report_type', type);

          fetch(generateEndpoint, { method: 'POST', body: data })
            .then(res => res.json())
            .then(json => {
              if (json.error) {
                print(`<span class="red">error: ${json.error}</span>`);
              } else {
                reportReady = true;
                print(`<span class="green">done. type "download" to get report.xlsx</span>`);
              }
            })
            .catch(() => print('<span class="red">error: generation failed.</span>'))
            .finally(() => {
              input.disabled = false;
              input.focus();
            });
        }
      }, (steps.length * 300) / total);
    },

    download: () => {
      if (!reportReady) {
        return ['<span class="red">nothing to download. run "generate &lt;type&gt;" first.</span>'];
      }
      window.location.href = downloadUrl;
      return ['<span class="green">downloading report.xlsx...</span>'];
    },

    clear: () => {
      output.innerHTML = '';
      return [];
    },
  };

  document.querySelector(rightSelector).addEventListener('click', () => input.focus());

  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const raw = input.value.trim();
    input.value = '';

    print(`<span class="green">$</span> ${raw}`);
    if (raw === '') return;

    const [cmd, ...rest] = raw.split(' ');
    const args = rest.join(' ');

    if (commands[cmd]) {
      const result = commands[cmd](args);
      if (result && typeof result.then === 'function') return;
      if (result) result.forEach(print);
    } else {
      print(`<span class="red">command not found: ${cmd}. type 'help'.</span>`);
    }
  });
}
