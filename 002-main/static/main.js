import { initDivider } from './components/divider.js';
import { initTerminal } from './components/terminal.js';
import { initUploader } from './components/uploader.js';
import { initFaq } from './components/faq.js';

initDivider({
  dividerId: 'divider',
  leftSelector: '.left',
  rightSelector: '.right',
  minPercent: 0.25,
});

initUploader({
  formId: 'upload-form',
  fileInputId: 'file-input',
  fileNameId: 'file-name',
  reportTypeId: 'report-type',
  statusId: 'upload-status',
  generateEndpoint: '/generate',
  downloadUrl: '/download',
});

initTerminal({
  inputId: 'terminal-input',
  outputId: 'terminal-output',
  fileInputId: 'file-input',
  fileNameId: 'file-name',
  reportTypeId: 'report-type',
  rightSelector: '.right',
  generateEndpoint: '/generate',
  downloadUrl: '/download',
});

initFaq('faq', [
  { q: 'Sales CSV columns?',                 a: 'date, region, product, units_sold, unit_price, cost' },
  { q: 'Financial CSV columns?',             a: 'date, category, description, amount, type (type must be "income" or "expense")' },
  { q: 'Inventory CSV columns?',             a: 'product, category, stock, reorder_level, unit_cost, unit_price' },
  { q: 'What does the report contain?',      a: 'Pivot tables, conditional formatting, and charts — all in a formatted .xlsx file.' },
  { q: 'Can I use the terminal instead?',    a: 'Yes. Type "help" in the terminal on the right to see all commands.' },
  { q: 'Will my original CSV be modified?',  a: 'No. Your file is read-only. The report is a new .xlsx file.' },
]);
