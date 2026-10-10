#!/usr/bin/env node
// Guided admin setup for Vercel. Asks for a password, then copies each value to the clipboard
// one at a time so it can be pasted straight into Vercel → Settings → Environment Variables.
// Usage (in the Terminal app): node scripts/admin-values.js
const { execSync } = require('child_process');
const readline = require('readline');
const { hashPassword } = require('../api/_lib/auth');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const lines = rl[Symbol.asyncIterator]();
const ask = async (q) => { process.stdout.write(q); const { value } = await lines.next(); return value ?? ''; };
const copy = (v) => execSync('pbcopy', { input: v });
(async () => {
  const email = (await ask('\nEmail you will log in with: ')).trim();
  const pw = await ask('New admin password (12+ characters, remember it): ');
  if (pw.length < 12) { console.log('\nToo short. Run it again with 12+ characters.'); process.exit(1); }
  const steps = [['ADMIN_EMAIL', email], ['ADMIN_PASSWORD_HASH', hashPassword(pw)], ['SESSION_SECRET', require('crypto').randomBytes(32).toString('hex')]];
  for (const [key, val] of steps) {
    copy(val);
    await ask(`\n✓ Copied the value for ${key}.\n  In Vercel, click the Value box under ${key} and paste (Cmd+V). Then press Enter here.`);
  }
  copy('');
  console.log('\nAll done. Set Type to "Secret", click Save, then Deployments → ⋯ → Redeploy.\n');
  rl.close();
})();
