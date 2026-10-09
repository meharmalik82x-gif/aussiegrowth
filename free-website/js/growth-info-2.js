(() => {
  // Only fast-track customers can add Growth here; everyone else gets a call option.
  const s = Funnel.get(), canAdd = s.reserved && s.offer === "fast";
  if (!canAdd) {
    document.querySelectorAll("[data-gcta]").forEach(a => { a.href = "tel:" + Funnel.C.PHONE_TEL; a.firstElementChild.textContent = "Talk to us about Growth"; });
    document.getElementById("cta-copy").textContent = "Priced on a quick call. No pressure.";
    document.querySelectorAll("[data-back]").forEach(a => a.href = "index.html");
  }
  const sticky = document.getElementById("sticky"), hero = document.querySelector(".hero"), fin = document.querySelector(".final");
  let past = false, atFinal = false; const upd = () => sticky.classList.toggle("show", past && !atFinal);
  new IntersectionObserver(([e]) => { past = !e.isIntersecting; upd(); }).observe(hero);
  new IntersectionObserver(([e]) => { atFinal = e.isIntersecting; upd(); }).observe(fin);
})();
