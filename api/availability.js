'use strict';
const { send } = require('./_lib/http');
const store = require('./_lib/store');
const { bookedCounts } = require('./_lib/slots');

// Public: how many free-website spots are taken per Monday. Dates and counts only, no lead details.
module.exports = async (req, res) => {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' }, { Allow: 'GET' });
  try {
    return send(res, 200, { booked: bookedCounts(await store.listAll()) });
  } catch (e) {
    console.error('availability failed:', e.code || e.name);
    return send(res, 503, { error: 'Unavailable' });
  }
};
