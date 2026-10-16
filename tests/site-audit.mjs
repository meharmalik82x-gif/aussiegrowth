// Opens every page (desktop + phone), scrolls through it and reports console errors,
// failed requests, broken images/anchors, sideways overflow and SEO basics.
// Usage: node tests/site-audit.mjs [baseUrl]   (default http://localhost:5188)
import { chromium } from 'playwright';
const BASE = process.argv[2] || 'http://localhost:5188';
const PAGES = ['/', '/web-development/', '/growth/', '/digital-agency/', '/google-ads/', '/meta-ads/', '/ai-automation/', '/tradie-websites/', '/local-business-marketing/', '/about/', '/free-website/', '/free-website/growth-info.html', '/free-website/reserve.html', '/admin/', '/this-page-does-not-exist'];
const VIEWS = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844, isMobile: true, hasTouch: true } };
const browser = await chromium.launch();
let problems = 0;
for (const [vname, vp] of Object.entries(VIEWS)) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.hasTouch });
  await ctx.route(/formsubmit\.co/, r => r.abort());
  for (const p of PAGES) {
    const page = await ctx.newPage(), errs = [];
    page.on('console', m => m.type() === 'error' && errs.push('console: ' + m.text().slice(0, 160)));
    page.on('pageerror', e => errs.push('js: ' + e.message.slice(0, 160)));
    page.on('response', r => { if (r.status() >= 400 && !r.url().endsWith(p)) errs.push(r.status() + ' ' + r.url().replace(BASE, '')); });
    page.on('requestfailed', r => !/formsubmit/.test(r.url()) && !(r.failure()?.errorText === 'net::ERR_ABORTED' && /\.(webm|mp4)$/.test(r.url())) && errs.push('failed ' + r.url().replace(BASE, '') + ' ' + r.failure()?.errorText));
    const resp = await page.goto(BASE + p, { waitUntil: 'load' }).catch(e => (errs.push('nav ' + e.message), null));
    await page.waitForTimeout(1500);
    const info = await page.evaluate(async () => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      const H = document.documentElement.scrollHeight;
      for (let y = 0; y <= H; y += 400) { window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); await sleep(50); }
      await sleep(1000);
      const d = document;
      const wide = [...d.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width && r.right > innerWidth + 1 && cs.position !== 'fixed' && cs.visibility !== 'hidden' && !e.closest('[aria-hidden=true],svg,.marquee,[class*=marquee],[class*=ticker],[class*=reel]'); }).slice(0, 4).map(e => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className ? '.' + e.className.split(' ')[0] : ''));
      return {
        title: d.title, h1: [...d.querySelectorAll('h1')].filter(h => h.offsetParent).length, desc: d.querySelector('meta[name=description]')?.content?.length || 0,
        scrollX: d.documentElement.scrollWidth - innerWidth, wide,
        brokenImg: [...d.images].filter(i => i.complete && i.naturalWidth === 0 && i.currentSrc).map(i => i.currentSrc),
        badAnchor: [...d.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href')).filter(h => h.length > 1 && !d.getElementById(decodeURIComponent(h.slice(1)))),
        deadLink: [...d.querySelectorAll('a')].filter(a => { const h = a.getAttribute('href'); return !h || h === '#'; }).map(a => a.outerHTML.slice(0, 80)),
        noAlt: [...d.images].filter(i => !i.hasAttribute('alt')).length,
        unlabeled: [...d.querySelectorAll('input:not([type=hidden]),select,textarea')].filter(e => !(e.labels?.length || e.getAttribute('aria-label') || e.getAttribute('aria-labelledby')) && !e.closest('[aria-hidden=true]') && e.tabIndex >= 0).map(e => e.name || e.id),
        links: [...new Set([...d.querySelectorAll('a[href]')].map(a => a.href).filter(h => h.startsWith(location.origin)).map(h => h.split('#')[0]))],
      };
    });
    // Expected: admin says 401 before login; the made-up URL is meant to 404.
    const issues = errs.filter(e => !(p === '/admin/' && /401/.test(e)) && !(p.includes('does-not-exist') && /404/.test(e)));
    if (info.scrollX > 0) issues.push(`sideways scroll ${info.scrollX}px: ${info.wide.join(', ')}`);
    for (const k of ['brokenImg', 'badAnchor', 'deadLink', 'unlabeled']) if (info[k].length) issues.push(k + ': ' + info[k].join(' | '));
    if (info.noAlt) issues.push('images without alt: ' + info.noAlt);
    if (info.h1 !== 1 && !p.includes('admin')) issues.push('h1 count ' + info.h1);
    if (!info.desc && !p.includes('admin') && !p.includes('does-not')) issues.push('no meta description');
    for (const l of info.links) { const r = await ctx.request.get(l, { maxRedirects: 5 }).catch(() => null); if (!r || r.status() >= 400) issues.push('broken link ' + l.replace(BASE, '') + ' ' + (r && r.status())); }
    console.log(`${issues.length ? '✗' : '✓'} [${vname}] ${p} (${resp && resp.status()}) "${info.title.slice(0, 50)}"`);
    issues.forEach(i => console.log('     - ' + i)); problems += issues.length;
    await page.close();
  }
  await ctx.close();
}
await browser.close();
console.log(problems ? `\n${problems} problem(s)` : '\nall clean');
