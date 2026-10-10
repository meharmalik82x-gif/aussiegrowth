// Shared funnel state + helpers. Plain script, loaded on every page after config.js.
(() => {
  const C = window.CONFIG;
  const KEY = "ag_funnel_v1";
  const get = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const set = patch => { const s = { ...get(), ...patch }; try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} return s; };
  const clear = () => { try { localStorage.removeItem(KEY); } catch {} };

  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const parse = k => new Date(k + "T12:00:00");
  const fmt = (k, o = { weekday: "long", day: "numeric", month: "long" }) => parse(k).toLocaleDateString("en-AU", o);
  const money = n => "$" + n.toLocaleString("en-AU");

  function mondays() {
    const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + C.MIN_LEAD_DAYS);
    d.setDate(d.getDate() + ((8 - d.getDay()) % 7));
    const end = new Date(); end.setHours(23, 59, 0, 0); end.setMonth(end.getMonth() + C.MONTHS_AHEAD);
    const out = [];
    for (; d <= end; d.setDate(d.getDate() + 7)) out.push(iso(d));
    return out;
  }
  const spotsLeft = k => Math.max(0, C.SPOTS_PER_MONDAY - (C.BOOKED[k] || 0));
  const nextOpen = () => mondays().find(k => spotsLeft(k) > 0);

  // Saves to the site's quote store (shows in /admin) — that's the source of truth.
  async function send(subject, fields) {
    if (C.TEST_MODE) { console.info("[TEST_MODE] not sent:", subject, fields); await new Promise(r => setTimeout(r, 600)); return; }
    const s = get(), fast = /FAST|GROWTH/.test(subject);
    const lines = Object.entries(fields).filter(([k, v]) => !k.startsWith("_") && v).map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`);
    // Email copy: sent once the save succeeds, or as the backup when the database is down (5xx / offline),
    // so the lead still arrives and the visitor carries on. A refused booking (e.g. full Monday) sends nothing.
    const mail = () => !C.FORM_EMAIL || /^(localhost|127\.)/.test(location.hostname) ? Promise.resolve(false)
      : fetch("https://formsubmit.co/ajax/" + encodeURIComponent(C.FORM_EMAIL), {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, keepalive: true,
        body: JSON.stringify({ _subject: subject, _captcha: "false", _template: "table", ...fields })
      }).then(x => x.json()).then(x => String(x.success) === "true").catch(() => false);
    let r = null, j = {};
    try {
      r = await fetch("/api/quote", {
        method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
        body: JSON.stringify({
          name: s.name, business: s.business, email: s.email, phone: s.phone,
          service: /GROWTH/.test(subject) ? "A combination" : "Web Development",
          businessType: "Other", budget: fast ? "$1–2K" : "Not sure", timeline: fast ? "ASAP" : "Next 1–3 months",
          message: ("[$0 WEBSITE OFFER] " + subject + "\n" + lines.join("\n")).slice(0, 2000),
          page_url: location.href.slice(0, 200), company_site: ""
        })
      });
      j = await r.json().catch(() => ({}));
    } catch {}
    if (r && r.ok) { mail(); return; }
    if ((!r || r.status >= 500) && await mail()) return;
    throw Object.assign(new Error(j.error || "Send failed (" + (r ? r.status : "offline") + ")"), { status: r ? r.status : 0 });
  }
  const leadFields = s => ({
    slot: s.date || "-",
    name: s.name, business: s.business, email: s.email, mobile: s.phone,
    current_website: s.website || "-", what_they_do: s.about || "-",
    monday: s.date ? fmt(s.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "-"
  });

  // Fill in contact links + testable copy + live availability anywhere on the page.
  function hydrate() {
    document.querySelectorAll("[data-tel]").forEach(a => a.href = "tel:" + C.PHONE_TEL);
    document.querySelectorAll("[data-wa]").forEach(a => a.href = "https://wa.me/" + C.WHATSAPP);
    document.querySelectorAll("[data-phone]").forEach(e => e.textContent = C.PHONE_DISPLAY);
    document.querySelectorAll("[data-copy]").forEach(e => { const t = C.COPY[e.dataset.copy]; if (t) e.textContent = t; });
    document.querySelectorAll("[data-fast-price]").forEach(e => e.textContent = money(C.FAST.price));
    const n = nextOpen();
    document.querySelectorAll("[data-next-monday]").forEach(e => e.textContent = n ? fmt(n, { weekday: "short", day: "numeric", month: "short" }) : "—");
    document.querySelectorAll("[data-next-spots]").forEach(e => e.textContent = n ? spotsLeft(n) : 0);
    if (C.TEST_MODE && !document.getElementById("test-banner")) {
      const b = document.createElement("div"); b.id = "test-banner"; b.setAttribute("role", "status");
      b.textContent = "Test mode: nothing is being sent. Set TEST_MODE to false in config.js to go live.";
      b.style.cssText = "position:fixed;left:0;right:0;top:0;z-index:100;background:#d9f45f;color:#14121a;font:700 13px/1.3 system-ui;text-align:center;padding:6px 12px";
      document.body.append(b); document.body.style.paddingTop = "28px";
    }
    document.querySelectorAll("[data-year]").forEach(e => e.textContent = new Date().getFullYear());
  }

  // Guards: never let someone land on a later step with a state that didn't happen.
  function guard(page) {
    const s = get();
    const go = p => { location.replace(p); return false; };
    if (page === "fast" && !s.reserved) return go("reserve.html");
    if (page === "growth" && !(s.reserved && s.offer === "fast")) return go(s.reserved ? "fast-track.html" : "reserve.html");
    if (page === "thanks" && !(s.reserved && s.offer)) return go(s.reserved ? "fast-track.html" : "index.html");
    return true;
  }

  // Live availability: bookings stored on the server. Pages re-render with Funnel.availability.then(...).
  const availability = fetch("/api/availability").then(r => r.ok ? r.json() : {}).then(j => {
    for (const [k, n] of Object.entries(j.booked || {})) C.BOOKED[k] = Math.max(C.BOOKED[k] || 0, n);
    hydrate();
  }).catch(() => {});

  window.Funnel = { availability, C, get, set, clear, mondays, spotsLeft, nextOpen, fmt, iso, parse, money, send, leadFields, hydrate, guard };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", hydrate) : hydrate();
})();
