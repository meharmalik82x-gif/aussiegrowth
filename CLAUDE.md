# Aussie Growth website — working notes for Claude

This folder is THE working copy of the live site https://www.aussiegrowth.agency.
When the owner asks for a change "on the live website", make it here, verify, then deploy.

## How it's wired
- Static HTML/CSS/JS + Vercel serverless functions in `api/` (quote/booking store + admin).
- GitHub repo: `jivesh-dahiya/aussiegrowth` (remote name here: `github`), branch `main`.
- Vercel project (owned by the GitHub repo owner's Vercel account) auto-deploys every push to `main`.
  Other branches get Preview URLs.
- Domain DNS: Hostinger -> Vercel. Don't touch DNS for normal changes.
- Env vars live on Vercel only (DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD_HASH, SESSION_SECRET). Never commit them.
- Strict CSP in `vercel.json`: no inline scripts, no third-party scripts/fonts. connect-src allows formsubmit.co.

## Key places
- Look & feel: `css/theme.css` (loaded last on every page). Tokens at the top.
- Homepage $0 offer scroll scene: `index.html` #offer + `js/offer.js`.
- Smooth scrolling: `js/smooth.js` (Lenis, driven by GSAP ticker).
- $0 funnel: `free-website/` — offer/prices/availability/contact/test-mode in `free-website/config.js`.
  Bookings -> `/api/quote` (shows in /admin) + email copy via FormSubmit to FORM_EMAIL.
  Weekly availability: edit `BOOKED` in `free-website/config.js`.
- Promo film: built in `~/aussiegrowth-promo` (Remotion, 48fps). Web encodes in `assets/video/`.
- Brand: `brand/` (gorilla.svg, board.html, exports). Not deployed (.vercelignore).

## Change -> live checklist
1. `git pull github main` first (someone else may have pushed).
2. Make the change. Run locally: `PORT=5188 node scripts/dev-server.js` -> http://localhost:5188
3. With the dev server running: `node tests/full-journey.mjs` (ALL CHECKS PASSED), `node tests/funnel.mjs` (FUNNEL OK), `node tests/site-audit.mjs` (all clean; pass the live URL to audit production). Eyeball desktop + mobile.
4. Commit, then for anything risky push a branch first for a Preview URL; otherwise `git push github main`.
5. Verify https://www.aussiegrowth.agency after the deploy (hard refresh), then report.
