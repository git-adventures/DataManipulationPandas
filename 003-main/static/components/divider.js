export function initDivider() {
  const divider = document.getElementById('divider');
  const left    = document.querySelector('.left');
  const right   = document.querySelector('.right');

  const total    = document.body.offsetWidth;
  const MIN_LEFT  = total * 0.25;
  const MIN_RIGHT = total * 0.25;
  let dragging = false;

  divider.addEventListener('mousedown', () => {
    dragging = true;
    divider.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const leftWidth = Math.min(Math.max(e.clientX, MIN_LEFT), total - MIN_RIGHT - 4);
    left.style.width  = leftWidth + 'px';
    right.style.width = (total - leftWidth - 4) + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    divider.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });
}
