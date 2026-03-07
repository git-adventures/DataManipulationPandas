const faqs = [
  { q: 'What databases are supported?',    a: 'SQLite, PostgreSQL, and MySQL. You can migrate between any combination of these.' },
  { q: 'Is my source database modified?',  a: 'No. The tool only reads from the source. All writes go to the target database.' },
  { q: 'What happens if migration fails?', a: 'Any tables already written to the target are automatically dropped, leaving it clean.' },
  { q: 'What is chunksize?',               a: 'Rows are transferred in batches (default 1000). Useful for large tables to avoid memory issues.' },
  { q: 'Can I use the terminal instead?',  a: 'Yes. Type "help" in the terminal on the right to see all available commands.' },
];

export function initFaq() {
  const container = document.getElementById('faq');

  faqs.forEach(({ q, a }) => {
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
