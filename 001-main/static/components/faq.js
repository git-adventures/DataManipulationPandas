const faqs = [
  { q: 'What does this tool do?',        a: 'Removes duplicates, missing values, and outliers from your CSV and exports a clean version.' },
  { q: 'Will my original file change?',  a: 'No. Your original file is untouched. A new cleaned file is created for download.' },
  { q: 'How are outliers detected?',     a: 'Using the IQR method — values beyond Q1/Q3 ± 1.5×IQR are flagged and removed.' },
  { q: 'Can I use the terminal instead?', a: 'Yes. Type "help" in the terminal on the right to see all commands.' },
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
