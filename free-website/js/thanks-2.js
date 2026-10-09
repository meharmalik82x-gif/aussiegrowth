(() => {
  const F = Funnel, C = F.C, $ = s => document.querySelector(s);
  const s = F.get();
  if (!(s.reserved && s.offer)) return;
  const fast = s.offer === "fast";
  $("#msg").textContent = fast ? "Your fast-track website project is confirmed." : "Your free website slot is booked.";
  $("#msg2").textContent = "We'll be in touch within 1–2 business days to set up your call and get everything we need to kick things off."
    + (fast && !s.paid ? " We'll send your secure payment link by email first." : "");
  const rows = [["Business", s.business], ["Start Monday", F.fmt(s.date)], ["Website", fast ? "Fast-track · " + F.money(C.FAST.price) + " · about 1 week" : "Free · about 1 month · 3 revisions"]];
  if (fast) rows.push(["Growth", s.growth && s.growth.length ? s.growth.join(" + ") + " (quoted on your call)" : "Not added"]);
  rows.push(["We'll contact you at", s.email + " · " + s.phone]);
  const tb = $("#sum");
  rows.forEach(([k, v]) => { const tr = tb.insertRow(), th = document.createElement("th"); th.scope = "row"; th.textContent = k; tr.append(th); tr.insertCell().textContent = v; });
})();
