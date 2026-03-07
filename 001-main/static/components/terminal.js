export function initTerminal() {
  const input = document.getElementById('terminal-input');
  const output = document.getElementById('terminal-output');
  const fileInput = document.getElementById('file-input');
  const form = document.getElementById('upload-form');

  let selectedFile = null;
  let cleaned = false;

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
      '  <span class="purple">upload</span>            — pick a CSV file',
      '  <span class="purple">run &lt;filename&gt;</span>    — clean the selected file',
      '  <span class="purple">download</span>          — download cleaned CSV (after run)',
      '  <span class="purple">clear</span>             — clear the terminal',
    ],

    upload: () => {
      fileInput.click();
      fileInput.addEventListener('change', () => {
        selectedFile = fileInput.files[0] || null;
        cleaned = false;
        if (selectedFile) {
          document.getElementById('file-name').textContent = selectedFile.name;
          print(`<span class="green">ready:</span> ${selectedFile.name}`);
          print(`<span class="gray">tip: type "run ${selectedFile.name}" to clean it</span>`);
        }
      }, { once: true });
      return ['<span class="yellow">opening file picker...</span>'];
    },

    run: (args) => {
      if (!selectedFile) {
        return ['<span class="red">no file loaded. run "upload" first.</span>'];
      }
      if (!args) {
        return [`<span class="red">usage: run &lt;filename&gt; — e.g. run ${selectedFile.name}</span>`];
      }
      if (args !== selectedFile.name) {
        return [`<span class="red">file "${args}" not found. did you mean "${selectedFile.name}"?</span>`];
      }

      input.disabled = true;

      const steps = [
        `<span class="yellow">loading ${selectedFile.name}...</span>`,
        `<span class="gray">scanning for duplicates...</span>`,
        `<span class="gray">checking missing values...</span>`,
        `<span class="gray">validating data types...</span>`,
        `<span class="gray">detecting outliers...</span>`,
        `<span class="yellow">cleaning data...</span>`,
      ];

      const bar = document.createElement('span');
      bar.className = 'line';
      output.appendChild(bar);
      output.scrollTop = output.scrollHeight;

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
          cleaned = true;
          input.disabled = false;
          input.focus();

          const data = new FormData(form);
          fetch('/', { method: 'POST', body: data })
            .then(() => print(`<span class="green">done. type "download" to get cleaned.csv</span>`))
            .catch(() => print(`<span class="red">error: cleaning failed.</span>`));
        }
      }, (steps.length * 300) / total);

      return [];
    },

    download: () => {
      if (!cleaned) {
        return ['<span class="red">nothing to download. run "upload" then "run &lt;filename&gt;" first.</span>'];
      }
      window.location.href = '/download';
      return ['<span class="green">downloading cleaned.csv...</span>'];
    },

    clear: () => {
      output.innerHTML = '';
      return [];
    },
  };

  document.querySelector('.right').addEventListener('click', () => input.focus());

  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const raw = input.value.trim();
    input.value = '';

    print(`<span class="green">$</span> ${raw}`);
    if (raw === '') return;

    const [cmd, ...rest] = raw.split(' ');
    const args = rest.join(' ');

    if (commands[cmd]) {
      commands[cmd](args).forEach(print);
    } else {
      print(`<span class="red">command not found: ${cmd}. type 'help'.</span>`);
    }
  });
}
