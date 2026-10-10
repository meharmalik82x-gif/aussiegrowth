(() => {
  const F = Funnel, C = F.C, $ = s => document.querySelector(s);
  let s = F.get();
  const steps = ["pick", "details", "confirm"];

  // Already reserved on this device? Don't create a second booking by accident.
  if (s.reserved) {
    $("#already").hidden = false; $("#already-date").textContent = F.fmt(s.date);
    document.querySelectorAll(".step-pane,.progress").forEach(e => e.hidden = true);
    $("#restart").onclick = () => { F.clear(); location.replace("reserve.html"); };
    return;
  }

  // ── Calendar ──
  const open = F.mondays();
  const first = F.parse(open[0]), last = F.parse(open[open.length - 1]);
  let view = s.date ? F.parse(s.date) : first; view = new Date(view.getFullYear(), view.getMonth(), 1);
  const cal = $("#cal");
  function renderCal() {
    $("#cal-title").textContent = view.toLocaleDateString("en-AU", { month: "long", year: "numeric" });
    $("#prev").disabled = view <= new Date(first.getFullYear(), first.getMonth(), 1);
    $("#next").disabled = view >= new Date(last.getFullYear(), last.getMonth(), 1);
    cal.innerHTML = "";
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach(d => { const e = document.createElement("div"); e.className = "dow"; e.textContent = d; e.setAttribute("aria-hidden", "true"); cal.append(e); });
    const y = view.getFullYear(), m = view.getMonth(), days = new Date(y, m + 1, 0).getDate();
    const lead = (new Date(y, m, 1).getDay() + 6) % 7;
    for (let i = 0; i < lead; i++) cal.append(document.createElement("div"));
    for (let d = 1; d <= days; d++) {
      const k = F.iso(new Date(y, m, d, 12)), isOpen = open.includes(k), left = isOpen ? F.spotsLeft(k) : 0;
      let el;
      if (isOpen && left) {
        el = document.createElement("button"); el.type = "button";
        el.className = "d" + (left === 1 ? " one" : "") + (s.date === k ? " sel" : "");
        el.setAttribute("aria-label", F.fmt(k) + ", " + (left === 1 ? "1 spot left" : left + " spots left"));
        el.setAttribute("aria-pressed", s.date === k);
        el.onclick = () => choose(k);
      } else {
        el = document.createElement("div");
        el.className = "d" + (isOpen ? " full" : "");
        if (isOpen) el.setAttribute("aria-label", F.fmt(k) + ", full");
      }
      el.textContent = d; cal.append(el);
    }
  }
  function choose(k) {
    s = F.set({ date: k }); renderCal(); updateWhen();
    const b = cal.querySelector(".sel"); b && b.focus();
    window.__pop && window.__pop("#when", { y: [10, 0], duration: 500 });
  }
  function updateWhen() {
    const ok = s.date && open.includes(s.date) && F.spotsLeft(s.date) > 0;
    if (s.date && !ok) s = F.set({ date: null }); // stale or now-full date
    $("#when").textContent = ok ? F.fmt(s.date) : "Tap a Monday";
    $("#to-details").disabled = !ok;
  }
  $("#prev").onclick = () => { view.setMonth(view.getMonth() - 1); renderCal(); };
  $("#next").onclick = () => { view.setMonth(view.getMonth() + 1); renderCal(); };
  renderCal(); updateWhen();
  F.availability.then(() => { renderCal(); updateWhen(); }); // re-draw with live bookings from the server

  // ── Steps (hash-based, so Back works) ──
  const canShow = st => st === "pick" || (st === "details" && s.date) || (st === "confirm" && s.date && validAll(false));
  function show(st) {
    if (!canShow(st)) st = s.date ? "details" : "pick";
    steps.forEach(x => $("#" + x).hidden = x !== st);
    document.querySelectorAll(".progress li").forEach((li, i) => {
      const cur = steps.indexOf(st);
      li.className = i < cur ? "done" : i === cur ? "on" : "";
      li.toggleAttribute("aria-current", i === cur);
    });
    if (st === "details") { $("#d-date").textContent = F.fmt(s.date); fill(); }
    if (st === "confirm") review();
    const pane = $("#" + st);
    window.__pop && window.__pop(pane.querySelectorAll(".f-grid > *"), { delay: (_, i) => i * 90 });
    scrollTo({ top: 0 });
    const h = pane.querySelector("h1"); h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true });
  }
  const go = st => { if (location.hash !== "#" + st) location.hash = st; else show(st); };
  addEventListener("hashchange", () => show(location.hash.slice(1) || "pick"));
  document.querySelectorAll("[data-go]").forEach(b => b.onclick = () => go(b.dataset.go));
  $("#to-details").onclick = () => go("details");

  // ── Form + inline validation ──
  const form = $("#form");
  const rules = {
    name: v => v.trim().length >= 2 || "Your name, so we know who to ask for.",
    business: v => v.trim().length >= 2 || "What's the business called?",
    phone: v => { const d = v.replace(/[^\d+]/g, "").replace(/^\+?61/, "0"); return /^0\d{9}$/.test(d) || "That doesn't look like an Aussie number. Try 04xx xxx xxx."; },
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "We'll need a real email for your confirmation.",
    website: v => !v.trim() || /\.[a-z]{2,}/i.test(v) || "Leave blank, or try something like yourbusiness.com.au"
  };
  function check(name, show = true) {
    const inp = form[name], res = rules[name](inp.value), ok = res === true;
    if (show) {
      inp.closest(".field").classList.toggle("bad", !ok);
      inp.closest(".field").classList.toggle("good", ok && !!inp.value.trim());
      inp.setAttribute("aria-invalid", !ok);
      $("#e-" + name).textContent = ok ? "" : res;
    }
    return ok;
  }
  function validAll(show = true) {
    if (show) return Object.keys(rules).map(n => check(n)).every(Boolean);
    const t = F.get(); return Object.keys(rules).every(n => rules[n](t[n] || "") === true);
  }
  Object.keys(rules).forEach(n => {
    form[n].addEventListener("blur", () => form[n].value && check(n));
    form[n].addEventListener("input", () => form[n].closest(".field").classList.contains("bad") && check(n));
  });
  function fill() { ["name", "business", "phone", "email", "website", "about"].forEach(n => form[n].value = s[n] || ""); }
  form.addEventListener("submit", e => {
    e.preventDefault();
    if (!validAll()) { form.querySelector(".bad input").focus(); return; }
    s = F.set(Object.fromEntries(["name", "business", "phone", "email", "website", "about"].map(n => [n, form[n].value.trim()])));
    go("confirm");
  });

  // ── Review + lock ──
  function review() {
    const rows = [["Start Monday", F.fmt(s.date), "pick"], ["Name", s.name, "details"], ["Business", s.business, "details"], ["Mobile", s.phone, "details"], ["Email", s.email, "details"]];
    if (s.website) rows.push(["Website", s.website, "details"]);
    rows.push(["Website fee", "$0"]);
    const tb = $("#review"); tb.innerHTML = "";
    rows.forEach(([k, v, edit]) => {
      const tr = tb.insertRow(), th = document.createElement("th"); th.scope = "row"; th.textContent = k; tr.append(th);
      const td = tr.insertCell(); td.textContent = v;
      if (edit) { const b = document.createElement("button"); b.type = "button"; b.className = "edit"; b.textContent = "edit"; b.setAttribute("aria-label", "Edit " + k); b.onclick = () => go(edit); td.append(b); }
    });
  }
  const lock = $("#lock"), err = $("#lock-err");
  lock.onclick = async () => {
    if (lock.getAttribute("aria-busy") === "true") return; // no double submits
    if (!s.date || F.spotsLeft(s.date) < 1 || !validAll(false)) { go("pick"); return; }
    lock.setAttribute("aria-busy", "true"); lock.disabled = true; lock.firstChild.textContent = "Locking it in…"; err.hidden = true;
    try {
      await F.send(`FREE SPOT RESERVED: ${s.business} · ${F.fmt(s.date, { day: "numeric", month: "short" })}`, { stage: "Reserved free website spot", _autoresponse: `Thanks ${s.name}, your free website spot for ${F.fmt(s.date)} is locked in. We'll be in touch within 1-2 business days to set up a quick call. Questions? Call ${C.PHONE_DISPLAY}. Aussie Growth`, ...F.leadFields(s) });
      F.set({ reserved: true, reservedAt: new Date().toISOString(), offer: null, growth: null });
      location.href = "fast-track.html";
    } catch (e) {
      console.error(e);
      if (e.status === 409) { // that Monday filled up while they were filling in the form
        C.BOOKED[s.date] = C.SPOTS_PER_MONDAY; s = F.set({ date: null }); renderCal(); updateWhen();
        err.textContent = e.message + " ";
        const pick = document.createElement("button"); pick.type = "button"; pick.className = "edit"; pick.textContent = "Pick another Monday"; pick.onclick = () => go("pick");
        err.append(pick); err.hidden = false;
        lock.removeAttribute("aria-busy"); lock.disabled = false; lock.firstChild.textContent = "Lock in my free spot";
        return;
      }
      err.innerHTML = ""; err.append("That didn't go through. Your spot isn't locked yet. Try again, or call ");
      const a = document.createElement("a"); a.href = "tel:" + C.PHONE_TEL; a.textContent = C.PHONE_DISPLAY; err.append(a, " and we'll lock it in for you.");
      // Last resort so the lead is never lost: send the booking from the visitor's own email or WhatsApp.
      const msg = `Hi Aussie Growth, I'd like to lock in my free website spot.\n\nMonday: ${F.fmt(s.date)}\nName: ${s.name}\nBusiness: ${s.business}\nMobile: ${s.phone}\nEmail: ${s.email}` + (s.website ? `\nWebsite: ${s.website}` : "") + (s.about ? `\nWhat we do: ${s.about}` : "");
      const row = document.createElement("div"); row.className = "alert-actions";
      const mail = document.createElement("a"); mail.href = `mailto:${C.FORM_EMAIL}?subject=${encodeURIComponent("Free website spot: " + s.business)}&body=${encodeURIComponent(msg)}`; mail.textContent = "Email it to us instead";
      const wa = document.createElement("a"); wa.href = `https://wa.me/${C.WHATSAPP}?text=${encodeURIComponent(msg)}`; wa.target = "_blank"; wa.rel = "noopener"; wa.textContent = "WhatsApp it to us";
      row.append(mail, wa); err.append(row);
      err.hidden = false;
      lock.removeAttribute("aria-busy"); lock.disabled = false; lock.firstChild.textContent = "Try again";
    }
  };

  show(location.hash.slice(1) || "pick");
})();
