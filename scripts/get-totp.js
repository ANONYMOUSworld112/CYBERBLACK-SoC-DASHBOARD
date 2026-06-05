import('../server/db.js').then(async (m) => {
  const { authenticator } = await import('otplib');
  const username = process.argv[2] || 'admin';
  const r = m.db.prepare('SELECT username, totp_secret, totp_enabled FROM users WHERE username = ?').get(username);
  if (!r) {
    console.error('user not found:', username);
    process.exit(1);
  }
  if (!r.totp_enabled) {
    console.error('user has no TOTP enrolled:', username);
    process.exit(2);
  }
  const code = authenticator.generate(r.totp_secret);
  const now = Math.floor(Date.now() / 1000);
  const remaining = 30 - (now % 30);
  const second = String(now % 60).padStart(2, '0');
  process.stdout.write(`\r[${second}s] TOTP for ${r.username}: ${code}  (valid ${remaining}s, refresh in ${remaining}s)  `);
});

setInterval(() => {
  import('../server/db.js').then(async (m) => {
    const { authenticator } = await import('otplib');
    const r = m.db.prepare('SELECT username, totp_secret FROM users WHERE username = ?').get('admin');
    const code = authenticator.generate(r.totp_secret);
    const now = Math.floor(Date.now() / 1000);
    const remaining = 30 - (now % 30);
    const second = String(now % 60).padStart(2, '0');
    process.stdout.write(`\r[${second}s] TOTP: ${code}  (valid ${remaining}s)   `);
  });
}, 1000);
