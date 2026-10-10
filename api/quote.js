'use strict';
const { send, readJson, hashIp, sameOrigin } = require('./_lib/http');
const { validateQuote } = require('./_lib/validate');
const store = require('./_lib/store');
const slots = require('./_lib/slots');

// Public: submit a quote request. This is the ONLY public endpoint that writes data,
// and there is no public endpoint that reads it.
module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' }, { Allow: 'POST' });
  if (!sameOrigin(req)) return send(res, 403, { error: 'Forbidden' });
  let body;
  try { body = await readJson(req); } catch (e) { return send(res, e.status || 400, { error: 'Invalid request.' }); }

  // Honeypot: real people never fill this. Bots get a fake success and nothing is stored.
  if (typeof body.company_site === 'string' && body.company_site.trim()) return send(res, 200, { ok: true });

  try {
    const ipKey = 'quote:' + hashIp(req);
    if ((await store.hit(ipKey, 60 * 60 * 1000)) > 5) return send(res, 429, { error: 'Too many requests. Try again later, or call us.' });
    if ((await store.hit('quote:all', 60 * 60 * 1000)) > 300) return send(res, 429, { error: 'Busy right now. Please call us.' });

    const v = validateQuote(body, body.page_url);
    if (!v.ok) return send(res, 400, { error: 'Please check the highlighted details.', fields: v.errors });
    // Free-website reservations: refuse a Monday that's already full.
    // ponytail: check-then-insert, so two people in the same second could both get the last spot.
    if (slots.isReservation(v.value.message)) {
      const k = slots.slotOf(v.value.message);
      if (k && (slots.bookedCounts(await store.listAll())[k] || 0) >= slots.SPOTS_PER_MONDAY) {
        return send(res, 409, { error: 'That Monday just filled up. Pick another one.', code: 'FULL' });
      }
    }
    await store.insertQuote(v.value);
    return send(res, 201, { ok: true });
  } catch (e) {
    console.error('quote submit failed:', e.code || e.name);
    return send(res, 500, { error: 'That didn’t send. Please try again or call us.' });
  }
};
