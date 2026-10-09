// Smooth, inertial scrolling (Lenis) driven by GSAP's ticker, so every ScrollTrigger scrub
// moves on the same frame as the page. Mouse wheels stop stepping; trackpads and touch stay native-feeling.
export function initSmooth({ gsap, ScrollTrigger }) {
  const Lenis = window.Lenis;
  if (!Lenis) return null;
  const navH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
  const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95, anchors: { offset: -navH() }, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  window.__lenis = lenis;
  // same-page links written as "/#section" (used on sub-pages' shared nav) behave like "#section" here
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="/#"]');
    if (!a || location.pathname !== '/') return;
    const el = document.querySelector(a.getAttribute('href').slice(1));
    if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -navH() }); history.replaceState(null, '', a.getAttribute('href').slice(1)); }
  });
  return lenis;
}
