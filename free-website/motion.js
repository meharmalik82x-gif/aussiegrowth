// Motion layer. Pure enhancement: if this file never loads, the page is fully usable.
import { animate, createTimeline, stagger, svg } from "/js/vendor/anime.esm.min.js";

window.__motion = true;
// Smooth, inertial scrolling to match the main site (skipped for reduced motion).
if (window.Lenis && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  window.__lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 0.95, anchors: { offset: -20 }, autoRaf: true });
}
const root = document.documentElement;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const draw = els => svg.createDrawable(els);

if (reduce) {
  root.classList.remove("motion");
} else {
  // ── Hero sequence ──
  const hero = document.querySelector(".hero");
  if (hero) {
    const tl = createTimeline({ defaults: { ease: "outExpo", duration: 1000 } });
    tl.add(hero.querySelectorAll(".kicker"), { opacity: [0, 1], y: [16, 0], duration: 700 })
      .add(hero.querySelectorAll(".h-line"), { opacity: [0, 1], y: [80, 0], delay: stagger(130) }, "-=500")
      .add(".offer-card", { opacity: [0, 1], y: [50, 0] }, "-=700");
    if (hero.querySelector(".stamp")) tl.add(".stamp", { scale: [0, 1], ease: "outElastic(1, .55)", duration: 900 }, "-=600");
    if (hero.querySelector(".after")) tl.add(".after", { opacity: [0, 1], y: [90, 0], duration: 1200 }, "-=1100");
    const notes = hero.querySelectorAll(".note");
    if (notes.length) {
      tl.add(notes, { opacity: [0, 1], duration: 400, delay: stagger(250) }, "-=500")
        .add(draw(hero.querySelectorAll(".draw")), { draw: ["0 0", "0 1"], duration: 900, ease: "inOutQuad", delay: stagger(250) }, "<<");
    }
    // slow parallax on the backdrop (transform only, paused when off-screen)
    const bg = hero.querySelector(".hero-bg img");
    let on = true, ticking = false;
    new IntersectionObserver(([e]) => on = e.isIntersecting).observe(hero);
    addEventListener("scroll", () => {
      if (!on || ticking) return; ticking = true;
      requestAnimationFrame(() => { bg.style.transform = `translate3d(0,${scrollY * 0.18}px,0) scale(1.06)`; ticking = false; });
    }, { passive: true });
  }

  // ── Scroll reveals (batched so siblings stagger) ──
  const io = new IntersectionObserver(entries => {
    const els = entries.filter(e => e.isIntersecting).map(e => e.target);
    if (!els.length) return;
    els.forEach(el => io.unobserve(el));
    animate(els, { opacity: [0, 1], y: [40, 0], duration: 1000, ease: "outExpo", delay: stagger(90) });
    els.forEach(el => {
      const d = el.querySelectorAll(".draw");
      if (d.length) animate(draw(d), { draw: ["0 0", "0 1"], duration: 1200, delay: 350, ease: "inOutQuad" });
      const n = el.querySelector(".big0 .num");
      if (n) { const o = { v: 1500 }; animate(o, { v: 0, duration: 1600, delay: 200, ease: "outQuart", onUpdate: () => n.textContent = Math.round(o.v).toLocaleString("en-AU") }); }
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll("[data-reveal]").forEach(el => { if (!el.closest(".hero")) io.observe(el); });

  // ── Magnetic buttons (mouse only) ──
  if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
    document.querySelectorAll(".btn").forEach(b => {
      b.addEventListener("pointermove", e => {
        const r = b.getBoundingClientRect();
        animate(b, { x: (e.clientX - r.left - r.width / 2) * 0.16, y: (e.clientY - r.top - r.height / 2) * 0.28, duration: 350, ease: "outQuad" });
      });
      b.addEventListener("pointerleave", () => animate(b, { x: 0, y: 0, duration: 800, ease: "outElastic(1, .5)" }));
    });
  }
}

// Small helpers other pages can use for state transitions.
export const pop = (el, opts = {}) => reduce ? null : animate(el, { opacity: [0, 1], y: [24, 0], duration: 700, ease: "outExpo", ...opts });
export const drawIn = (els, opts = {}) => reduce ? null : animate(draw(els), { draw: ["0 0", "0 1"], duration: 900, ease: "inOutQuad", ...opts });
window.__pop = pop; window.__drawIn = drawIn;
