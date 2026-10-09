// The $0 offer scene: a pinned stage where the tired shopfront becomes the busy one as you scroll,
// then the offer lands. Without GSAP / with reduced motion, the "after" state just shows statically.
export function initOffer({ gsap, ScrollTrigger }) {
  const root = document.querySelector('[data-offer]');
  if (!root) return;
  const q = (s) => root.querySelector(s);
  const after = q('.offer-after'), num = q('[data-offer-num]');
  const lineA = q('[data-line="a"]'), lineB = q('[data-line="b"]');
  const noteA = q('[data-note="a"]'), noteB = q('[data-note="b"]');
  const card = q('.offer-card'), before = q('.offer-before img');

  root.classList.add('is-live');
  // Decode both big frames off the main thread well before they're needed, so the wipe never hitches.
  const imgs = [...root.querySelectorAll('img')];
  new IntersectionObserver((es, io) => {
    if (!es.some((e) => e.isIntersecting)) return;
    io.disconnect();
    imgs.forEach((im) => { im.loading = 'eager'; im.decode?.().catch(() => {}); });
  }, { rootMargin: '250% 0px' }).observe(root);
  gsap.set(after, { clipPath: 'circle(0% at 72% 34%)' });
  gsap.set([lineB, noteB, card], { autoAlpha: 0, y: 40 });
  gsap.set(lineA, { autoAlpha: 0, y: 60 });
  const counter = { v: 1500 };

  const small = matchMedia('(max-width: 800px)').matches;
  // Desktop: pinned and scrubbed by scroll. Phones: plays once on arrival (pinning a tall stacked layout feels stuck).
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: small
      ? { trigger: root, start: 'top 65%', toggleActions: 'play none none none' }
      : { trigger: root, start: 'top top', end: '+=260%', scrub: 1, pin: q('.offer-stage'), anticipatePin: 1 },
  });
  if (small) tl.timeScale(1.6);
  tl.to(lineA, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0)
    .fromTo(before, { scale: 1.12 }, { scale: 1, duration: 1.6 }, 0)
    .to(noteA, { autoAlpha: 0, y: -20, duration: 0.3 }, 0.9)
    .to(after, { clipPath: 'circle(150% at 72% 34%)', duration: 1.4, ease: 'power2.inOut' }, 1)
    .to(lineA, { autoAlpha: 0.35, duration: 0.4 }, 1.5)
    .to([lineB, noteB], { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.15 }, 1.7)
    .to(card, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 2.4)
    .to(counter, { v: 0, duration: 0.8, ease: 'power2.out', onUpdate: () => { num.textContent = Math.round(counter.v).toLocaleString('en-AU'); } }, 2.5)
    .to({}, { duration: 0.5 });
  ScrollTrigger.refresh();
}
