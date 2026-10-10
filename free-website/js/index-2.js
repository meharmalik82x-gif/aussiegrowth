(() => {
  const F = Funnel;
  // next six Mondays with real availability
  const weeks = document.getElementById("weeks");
  const renderWeeks = () => { weeks.textContent = ""; F.mondays().slice(0, 6).forEach(k => {
    const left = F.spotsLeft(k), d = document.createElement("div");
    d.className = "wk" + (left ? "" : " full");
    d.setAttribute("aria-label", F.fmt(k, { day: "numeric", month: "long" }) + ": " + (left ? left + " of " + F.C.SPOTS_PER_MONDAY + " spots left" : "full"));
    d.innerHTML = "<small></small><b></b><div class='pips' aria-hidden='true'></div>";
    d.children[0].textContent = F.fmt(k, { month: "short" });
    d.children[1].textContent = F.parse(k).getDate();
    for (let i = 0; i < F.C.SPOTS_PER_MONDAY; i++) { const p = document.createElement("span"); p.className = "pip" + (i >= left ? " taken" : ""); d.children[2].append(p); }
    weeks.append(d);
  }); };
  renderWeeks(); F.availability.then(renderWeeks); // config first, then live bookings from the server
  // sticky CTA on mobile once the hero is gone, hidden again at the final CTA
  const sticky = document.getElementById("sticky"), hero = document.querySelector(".hero"), fin = document.querySelector(".final");
  let pastHero = false, atFinal = false;
  const upd = () => sticky.classList.toggle("show", pastHero && !atFinal);
  new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; upd(); }).observe(hero);
  new IntersectionObserver(([e]) => { atFinal = e.isIntersecting; upd(); }).observe(fin);
  // project videos: hover on desktop, in-view on touch. Loaded only when needed.
  const play = w => { const v = w.querySelector("video"); if (!v.src) v.src = v.dataset.src; v.play().then(() => w.classList.add("playing")).catch(() => {}); };
  const stop = w => { const v = w.querySelector("video"); v.pause(); w.classList.remove("playing"); };
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) document.querySelectorAll(".w").forEach(w => {
    if (fine) { w.addEventListener("mouseenter", () => play(w)); w.addEventListener("mouseleave", () => stop(w)); }
    else new IntersectionObserver(([e]) => e.intersectionRatio > .7 ? play(w) : stop(w), { threshold: [0, .7] }).observe(w);
  });
})();
