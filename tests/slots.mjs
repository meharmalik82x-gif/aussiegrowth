// Free-website availability: counting bookings per Monday. Usage: node tests/slots.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const s = createRequire(import.meta.url)('../api/_lib/slots.js');
assert.equal(s.slotOf('x\nslot: 2026-10-19\ny'), '2026-10-19');
assert.equal(s.slotOf('a\nmonday: Monday 19 October 2026\n'), '2026-10-19'); // bookings made before the slot line existed
assert.equal(s.slotOf('monday: Monday 2 November 2026'), '2026-11-02');
const q = (slot, status = 'NEW', what = 'FREE SPOT RESERVED') => ({ status, message: `[$0 WEBSITE OFFER] ${what}: X\nslot: ${slot}` });
assert.deepEqual(s.bookedCounts([q('2026-10-19'), q('2026-10-19'), q('2026-10-26', 'ARCHIVED'), q('2026-10-26', 'NEW', 'Kept free spot')]), { '2026-10-19': 2 });
const cfg = (await import('node:fs')).readFileSync(new URL('../free-website/config.js', import.meta.url), 'utf8');
assert.equal(Number(/SPOTS_PER_MONDAY:\s*(\d+)/.exec(cfg)[1]), s.SPOTS_PER_MONDAY, 'server and config.js spots per Monday match');
console.log('SLOTS OK');
