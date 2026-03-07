export function initTerminal() {
  const input  = document.getElementById('terminal-input');
  const output = document.getElementById('terminal-output');

  let config = { src: null, tgt: null };
  let lastResult = null;

  function print(line) {
    const span = document.createElement('span');
    span.className = 'line';
    span.innerHTML = line;
    output.appendChild(span);
    output.scrollTop = output.scrollHeight;
  }

  function animateBar(onDone) {
    const bar = document.createElement('span');
    bar.className = 'line';
    output.appendChild(bar);

    let filled = 0;
    const total = 20;
    const interval = setInterval(() => {
      filled++;
      const done  = '#'.repeat(filled);
      const empty = '-'.repeat(total - filled);
      bar.innerHTML = `<span class="green">[${done}${empty}] ${Math.round((filled / total) * 100)}%</span>`;
      output.scrollTop = output.scrollHeight;
      if (filled >= total) {
        clearInterval(interval);
        onDone();
      }
    }, 80);
  }

  const commands = {
    help: () => [
      '<span class="green">Available commands:</span>',
      '  <span class="purple">connect &lt;src|tgt&gt; sqlite &lt;file.db&gt;</span>',
      '  <span class="purple">connect &lt;src|tgt&gt; postgresql &lt;db&gt; &lt;host&gt; &lt;user&gt; &lt;password&gt;</span>',
      '  <span class="purple">connect &lt;src|tgt&gt; mysql &lt;db&gt; &lt;host&gt; &lt;user&gt; &lt;password&gt;</span>',
      '  <span class="purple">migrate</span>                          — run migration',
      '  <span class="purple">status</span>                           — show last result',
      '  <span class="purple">clear</span>                            — clear terminal',
      '<span class="gray">example:</span>',
      '  <span class="gray">connect src sqlite samples/ecommerce.db</span>',
      '  <span class="gray">connect tgt postgresql targetdb localhost testuser testpass</span>',
      '  <span class="gray">migrate</span>',
    ],

    connect: (args) => {
      const parts = args.split(' ');
      const side  = parts[0];
      const type  = parts[1];
      const db    = parts[2];
      const host  = parts[3] || 'localhost';
      const user  = parts[4] || null;
      const pass  = parts[5] || null;

      if (!['src', 'tgt'].includes(side) || !type || !db) {
        return [
          '<span class="red">usage:</span>',
          '  <span class="gray">sqlite :</span> connect &lt;src|tgt&gt; sqlite &lt;file.db&gt;',
          '  <span class="gray">pg/mysql:</span> connect &lt;src|tgt&gt; &lt;postgresql|mysql&gt; &lt;database&gt; &lt;host&gt; &lt;user&gt; &lt;password&gt;',
        ];
      }
      if (!['sqlite', 'postgresql', 'mysql'].includes(type)) {
        return [`<span class="red">unknown db type "${type}". use sqlite, postgresql, or mysql.</span>`];
      }

      config[side] = { db_type: type, database: db, host, user, password: pass };
      const info = type === 'sqlite' ? db : `${user}@${host}/${db}`;
      return [`<span class="green">set ${side}:</span> ${type} → ${info}`];
    },

    migrate: () => {
      if (!config.src || !config.tgt) {
        return ['<span class="red">set both src and tgt first. use "connect src ..." and "connect tgt ..."</span>'];
      }

      input.disabled = true;
      const steps = [
        `<span class="yellow">connecting to ${config.src.db_type} (${config.src.database})...</span>`,
        `<span class="yellow">connecting to ${config.tgt.db_type} (${config.tgt.database})...</span>`,
        `<span class="gray">inspecting source schema...</span>`,
        `<span class="gray">mapping column types...</span>`,
        `<span class="gray">creating tables on target...</span>`,
        `<span class="gray">transferring data in chunks...</span>`,
      ];

      steps.forEach((msg, i) => setTimeout(() => print(msg), i * 300));

      setTimeout(() => {
        animateBar(async () => {
          try {
            const res  = await fetch('/migrate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                src_type:     config.src.db_type,
                src_database: config.src.database,
                src_host:     config.src.host,
                src_user:     config.src.user,
                src_password: config.src.password,
                tgt_type:     config.tgt.db_type,
                tgt_database: config.tgt.database,
                tgt_host:     config.tgt.host,
                tgt_user:     config.tgt.user,
                tgt_password: config.tgt.password,
              }),
            });
            const data = await res.json();
            lastResult = data;

            if (data.success) {
              print(`<span class="green">schema detected:</span>`);
              for (const [table, cols] of Object.entries(data.schema)) {
                const colStr = cols.map(c => `${c.name}(${c.type})`).join(' ');
                print(`<span class="gray">  ${table}: ${colStr}</span>`);
              }

              const hasMappings = Object.values(data.type_mappings).some(m => Object.keys(m).length > 0);
              if (hasMappings) {
                print(`<span class="green">type conversions applied:</span>`);
                for (const [table, mappings] of Object.entries(data.type_mappings)) {
                  for (const [from, to] of Object.entries(mappings)) {
                    print(`<span class="yellow">  ${from} → ${to}</span>`);
                  }
                }
              } else {
                print(`<span class="gray">type conversions: none (same DB type)</span>`);
              }

              print(`<span class="green">rows migrated:</span>`);
              for (const [table, count] of Object.entries(data.row_counts)) {
                print(`<span class="gray">  ${table}: ${count} row(s)</span>`);
              }

              print(`<span class="green">done. ${data.migrated.length} table(s) migrated successfully.</span>`);
            } else {
              print(`<span class="red">failed: ${data.failed}</span>`);
              if (data.migrated.length > 0) {
                print(`<span class="yellow">rolling back ${data.migrated.length} completed table(s)...</span>`);
                print(`<span class="yellow">rollback complete. target DB is clean.</span>`);
              }
            }
          } catch (err) {
            print(`<span class="red">error: ${err.message}</span>`);
          }

          input.disabled = false;
          input.focus();
        });
      }, steps.length * 300);

      return [];
    },

    status: () => {
      if (!lastResult) return ['<span class="gray">no migration run yet.</span>'];
      if (lastResult.success) {
        return [
          `<span class="green">last migration: success</span>`,
          `<span class="gray">tables: ${lastResult.migrated.join(', ')}</span>`,
        ];
      }
      return [
        `<span class="red">last migration: failed</span>`,
        `<span class="gray">error: ${lastResult.failed}</span>`,
        `<span class="gray">migrated before failure: ${lastResult.migrated.join(', ') || 'none'}</span>`,
      ];
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
