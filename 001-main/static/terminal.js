const input = document.getElementById('terminal-input');
const output = document.getElementById('terminal-output');
const fileInput = document.getElementById('file-input');
const form = document.getElementById('upload-form');

const commands = {
  help: () => [
    '<span class="green">Available commands:</span>',
    '  <span class="purple">upload</span>   — open file picker to choose a CSV',
    '  <span class="purple">run</span>      — submit the form and clean the file',
    '  <span class="purple">download</span> — download the cleaned CSV',
    '  <span class="purple">clear</span>    — clear the terminal',
  ],
  upload: () => {
    fileInput.click();
    fileInput.addEventListener('change', () => {
      const name = fileInput.files[0]?.name || '';
      document.getElementById('file-name').textContent = name;
      print(`<span class="green">File selected: ${name}</span>`);
    }, { once: true });
    return ['<span class="yellow">Opening file picker...</span>'];
  },
  run: () => {
    if (!fileInput.files[0]) {
      return ['<span class="red">No file selected. Run "upload" first.</span>'];
    }
    form.submit();
    return ['<span class="yellow">Submitting... please wait.</span>'];
  },
  download: () => {
    window.location.href = '/download';
    return ['<span class="green">Downloading cleaned.csv...</span>'];
  },
  clear: () => {
    output.innerHTML = '';
    return [];
  },
};

function print(line) {
  const span = document.createElement('span');
  span.className = 'line';
  span.innerHTML = line;
  output.appendChild(span);
  output.scrollTop = output.scrollHeight;
}

// Resizable split pane
const divider = document.getElementById('divider');
const left = document.querySelector('.left');
const right = document.querySelector('.right');

let dragging = false;

divider.addEventListener('mousedown', () => {
  dragging = true;
  divider.classList.add('dragging');
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', (e) => {
  if (!dragging) return;
  const totalWidth = document.body.offsetWidth;
  const leftWidth = e.clientX;
  const rightWidth = totalWidth - leftWidth - 4;
  if (leftWidth < 200 || rightWidth < 200) return;
  left.style.width = leftWidth + 'px';
  right.style.width = rightWidth + 'px';
});

document.addEventListener('mouseup', () => {
  dragging = false;
  divider.classList.remove('dragging');
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
});

input.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const cmd = input.value.trim().toLowerCase();
  input.value = '';

  print(`<span class="green">$</span> ${cmd}`);

  if (cmd === '') return;

  if (commands[cmd]) {
    const lines = commands[cmd]();
    lines.forEach(print);
  } else {
    print(`<span class="red">command not found: ${cmd}. Type 'help'.</span>`);
  }
});
