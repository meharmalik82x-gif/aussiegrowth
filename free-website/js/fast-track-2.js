(() => {
  const F = Funnel, C = F.C, $ = s => document.querySelector(s);
  const s = F.get();
  if (!s.reserved) return;
  $("#date").textContent = F.fmt(s.date);
  $("#pay-note").textContent = C.PAYMENT_LINK
    ? "Fast-track payment is taken securely by Stripe on the next screen."
    : "No payment is taken on this page. Choose fast-track and we'll email you a secure payment link.";

  const fast = $("#go-fast"), free = $("#go-free"), err = $("#err");
  const busy = on => { [fast, free].forEach(b => { b.disabled = on; b.setAttribute("aria-busy", on); }); };

  fast.onclick = async () => {
    if (fast.getAttribute("aria-busy") === "true") return;
    busy(true); fast.firstChild.textContent = "One sec…"; err.hidden = true;
    try {
      await F.send(`FAST-TRACK CHOSEN ($${C.FAST.price}): ${s.business}`, { stage: "Chose $1,500 fast-track" + (C.PAYMENT_LINK ? " (sent to Stripe)" : " (needs payment link)"), ...F.leadFields(s) });
      F.set({ offer: "fast", paid: false });
      if (C.PAYMENT_LINK) {
        const u = new URL(C.PAYMENT_LINK); if (s.email) u.searchParams.set("prefilled_email", s.email);
        location.href = u.toString();
      } else location.href = "growth.html";
    } catch (e) {
      console.error(e);
      err.textContent = "That didn't go through, so nothing's changed. Your free spot is still locked in. Try again, or call " + C.PHONE_DISPLAY + ".";
      err.hidden = false; busy(false); fast.firstChild.textContent = "Yes, get it in 1 week";
    }
  };
  free.onclick = () => {
    if (free.getAttribute("aria-busy") === "true") return;
    busy(true);
    F.set({ offer: "free" });
    F.send(`Kept free spot: ${s.business}`, { stage: "Declined fast-track, kept free spot", ...F.leadFields(s) }).catch(() => {}); // nice-to-know only; the reservation is already in
    location.href = "thanks.html";
  };
})();
