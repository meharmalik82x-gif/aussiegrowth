// Clicks through the $0 funnel like a visitor: free path, fast-track + Growth path,
// and the "database down" safety net (email backup lets the visitor carry on).
// Needs the dev server: PORT=5188 node scripts/dev-server.js   then   node tests/funnel.mjs
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
// ag.test maps to localhost so the page behaves as if it's on the live domain (email copies on).
const B = 'http://ag.test:5188/free-website/';
const browser = await chromium.launch({ args: ['--host-resolver-rules=MAP ag.test 127.0.0.1'] });

async function run({ apiDown = false, mailOk = true, fast = false }) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const sent = { api: [], mail: [] };
  await ctx.route(/formsubmit\.co/, (r) => { sent.mail.push(r.request().postDataJSON()); r.fulfill({ contentType: 'application/json', body: JSON.stringify({ success: mailOk ? 'true' : 'false' }) }); });
  // Real saving is covered by full-journey.mjs (and repeat runs would trip the 5/hour limit).
  await ctx.route('**/api/quote', (r) => { sent.api.push(r.request().postDataJSON()); r.fulfill(apiDown ? { status: 500, contentType: 'application/json', body: '{"error":"x"}' } : { status: 201, contentType: 'application/json', body: '{"ok":true}' }); });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(B);
  await page.locator('a[href*="reserve"]:visible').first().click();
  await page.waitForURL(/reserve/);
  await page.locator('#cal button[aria-label*="spot"]').first().click();
  await page.click('#to-details');
  await page.fill('#f-name', 'Audit Test'); await page.fill('#f-business', 'Audit Plumbing');
  await page.fill('#f-phone', '0400 000 000'); await page.fill('#f-email', 'audit@example.com');
  await page.click('#form button[type=submit]');
  await page.click('#lock');
  if (apiDown && !mailOk) {
    await page.locator('#lock-err').waitFor({ state: 'visible' });
    assert.ok(/reserve/.test(page.url()), 'stays on reserve when nothing got through');
    await ctx.close(); return { sent, errs, end: 'error shown' };
  }
  await page.waitForURL(/fast-track/);
  if (fast) {
    await page.click('#go-fast'); await page.waitForURL(/growth\.html/);
    await page.click('#yes'); await page.waitForURL(/thanks/);
  } else { await page.click('#go-free'); await page.waitForURL(/thanks/); }
  const thanks = await page.locator('main').innerText();
  await page.waitForTimeout(500);
  await ctx.close();
  return { sent, errs, thanks };
}

let r = await run({});
assert.equal(r.errs.length, 0, r.errs.join());
assert.ok(r.sent.api.length >= 2 && r.sent.api[0].message.includes('FREE SPOT RESERVED'), 'reservation saved');
assert.ok(r.sent.mail.length >= 2, 'email copies sent');
assert.match(r.thanks, /Audit Plumbing/); console.log('  ✓ free path: reserve → keep it free → thanks (saved + emailed, incl. the "kept free" note)');

r = await run({ fast: true });
assert.ok(r.sent.api.some((b) => b.message.includes('FAST-TRACK')) && r.sent.api.some((b) => b.message.includes('GROWTH ADD-ON')));
assert.match(r.thanks, /Fast-track/); console.log('  ✓ fast path: reserve → fast-track → Growth → thanks');

r = await run({ apiDown: true });
assert.match(r.thanks, /Audit Plumbing/); console.log('  ✓ database down + email OK: visitor carries on, lead arrives by email');

r = await run({ apiDown: true, mailOk: false });
console.log('  ✓ database down + email down: clear error, visitor stays put (' + r.end + ')');

await browser.close();
console.log('FUNNEL OK');
