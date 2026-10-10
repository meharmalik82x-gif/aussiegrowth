'use strict';
// Free-website bookings per Monday, counted from stored quotes (the funnel saves them with this prefix).
// Archive a booking in /admin to free its spot.
const SPOTS_PER_MONDAY = 2; // keep in sync with SPOTS_PER_MONDAY in free-website/config.js
const RESERVED = '[$0 WEBSITE OFFER] FREE SPOT RESERVED';
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

// "slot: 2026-10-19", or the older human line "monday: Monday 19 October 2026".
function slotOf(message) {
  const iso = /^slot: (\d{4}-\d{2}-\d{2})$/m.exec(message);
  if (iso) return iso[1];
  const h = /^monday: \w+ (\d{1,2}) (\w+) (\d{4})$/m.exec(message);
  const m = h && MONTHS.indexOf(h[2].toLowerCase());
  return h && m >= 0 ? `${h[3]}-${String(m + 1).padStart(2, '0')}-${h[1].padStart(2, '0')}` : null;
}

const isReservation = (message) => String(message || '').startsWith(RESERVED);

// ponytail: scans every quote; fine for hundreds of rows, add a slot column + index if it ever gets big.
function bookedCounts(quotes) {
  const out = {};
  for (const q of quotes) {
    if (q.status === 'ARCHIVED' || !isReservation(q.message)) continue;
    const k = slotOf(q.message);
    if (k) out[k] = (out[k] || 0) + 1;
  }
  return out;
}

module.exports = { SPOTS_PER_MONDAY, slotOf, isReservation, bookedCounts };
