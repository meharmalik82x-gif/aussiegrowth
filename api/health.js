'use strict';
const { send } = require('./_lib/http');
const store = require('./_lib/store');

// Setup check: says whether the database and admin settings work. Never prints values.
module.exports = async (req, res) => {
  const out = { database: 'missing', admin: {} };
  const name = store.dbEnv();
  if (name) {
    out.database_variable = name;
    try { await store.init(); out.database = 'ok'; } catch (e) { out.database = 'error'; out.error_code = String(e.code || e.name).slice(0, 40); }
  }
  for (const k of ['ADMIN_EMAIL', 'ADMIN_PASSWORD_HASH', 'SESSION_SECRET']) out.admin[k] = process.env[k] ? 'set' : 'missing';
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) out.admin.SESSION_SECRET = 'too short (needs 32+ characters)';
  return send(res, 200, out);
};
