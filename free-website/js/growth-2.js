(() => {
  const F = Funnel, C = F.C, $ = s => document.querySelector(s);
  const s = F.get();
  if (!(s.reserved && s.offer === "fast")) return;
  $("#status").textContent = s.paid
    ? "Fast-track confirmed. Stripe will email your receipt."
    : "Fast-track locked in. We'll email a secure payment link to " + s.email + ".";
  $("#price-note").textContent = C.GROWTH_PRICE_NOTE + " Adding it doesn't change your website price.";

  const yes = $("#yes"), no = $("#no"), err = $("#err");
  const picked = () => [...document.querySelectorAll("input[name=g]:checked")].map(i => i.value);
  document.querySelectorAll("input[name=g]").forEach(i => i.addEventListener("change", () => yes.disabled = !picked().length));
  const busy = on => [yes, no].forEach(b => { b.disabled = on; b.setAttribute("aria-busy", on); });

  yes.onclick = async () => {
    if (yes.getAttribute("aria-busy") === "true" || !picked().length) return;
    busy(true); yes.firstChild.textContent = "Adding…"; err.hidden = true;
    try {
      await F.send(`GROWTH ADD-ON REQUESTED: ${s.business}`, { stage: "Fast-track customer wants Growth", growth: picked().join(" + "), ...F.leadFields(s) });
      F.set({ growth: picked() });
      location.href = "thanks.html";
    } catch (e) {
      console.error(e);
      err.textContent = "That didn't go through. Your website is still booked. Try again, or just mention it on your call.";
      err.hidden = false; busy(false); yes.firstChild.textContent = "Add Growth to my project";
    }
  };
  no.onclick = () => { F.set({ growth: [] }); location.href = "thanks.html"; };
})();
