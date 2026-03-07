export function initFaq(containerId = 'faq', items = []) {
  const container = document.getElementById(containerId);

  items.forEach(({ q, a }) => {
    const item = document.createElement('div');
    item.className = 'faq-item';

    const answer = document.createElement('div');
    answer.className = 'faq-answer';
    answer.textContent = a;

    const btn = document.createElement('button');
    btn.className = 'faq-question';
    btn.textContent = q;
    btn.addEventListener('click', () => {
      const isOpen = answer.classList.contains('open');
      container.querySelectorAll('.faq-answer').forEach(el => el.classList.remove('open'));
      container.querySelectorAll('.faq-question').forEach(el => el.classList.remove('active'));
      if (!isOpen) {
        answer.classList.add('open');
        btn.classList.add('active');
      }
    });

    item.appendChild(answer);
    item.appendChild(btn);
    container.appendChild(item);
  });
}
