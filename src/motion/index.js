// NOVA motion system. One easing family, three durations, one stagger.
// Everything animates transform/opacity/clip-path only (no layout shifts) and
// is skipped entirely under prefers-reduced-motion.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const EASE = { out: 'expo.out', soft: 'power3.out', inOut: 'power3.inOut', in: 'power2.in' };
export const DUR = { fast: 0.35, base: 0.8, slow: 1.2 };
export const STAGGER = 0.08;
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const FROM = {
  up: { y: 40, opacity: 0 },
  left: { x: -70, opacity: 0 },
  right: { x: 70, opacity: 0 },
  fade: { opacity: 0 },
  mask: { clipPath: 'inset(0% 0% 100% 0%)', opacity: 1 }
};
const TO = { y: 0, x: 0, opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' };

function reveal(items, trigger) {
  items.forEach((el, i) => {
    const type = el.dataset.reveal || 'up';
    const from = FROM[type] || FROM.up;
    const to = { ...TO, duration: type === 'mask' ? DUR.slow : DUR.base, delay: i * STAGGER, ease: EASE.out, clearProps: 'transform,opacity,clipPath' };
    if (type === 'mask') {
      const inner = el.firstElementChild;
      if (inner) gsap.fromTo(inner, { scale: 1.18 }, { scale: 1, duration: DUR.slow * 1.4, delay: i * STAGGER, ease: EASE.out, scrollTrigger: { trigger, start: 'top 88%', once: true }, clearProps: 'transform' });
    }
    gsap.fromTo(el, from, { ...to, scrollTrigger: { trigger, start: 'top 88%', once: true } });
  });
}

// Binds every [data-reveal], [data-stagger], .line and [data-parallax] inside root.
export function mountMotion(root) {
  if (reducedMotion()) return;
  root.querySelectorAll('[data-stagger]').forEach(group => reveal([...group.querySelectorAll(':scope > [data-reveal]')], group));
  root.querySelectorAll('[data-reveal]').forEach(el => { if (!el.parentElement.hasAttribute('data-stagger')) reveal([el], el); });

  root.querySelectorAll('[data-lines]').forEach(block => {
    gsap.fromTo(block.querySelectorAll('.line > span'), { yPercent: 110 }, {
      yPercent: 0, duration: DUR.slow, stagger: STAGGER * 1.5, ease: EASE.out,
      scrollTrigger: { trigger: block, start: 'top 85%', once: true }
    });
  });

  const mm = gsap.matchMedia();
  mm.add('(min-width: 801px)', () => {
    root.querySelectorAll('[data-parallax]').forEach(el => {
      const amount = parseFloat(el.dataset.parallax) || 0.08;
      gsap.to(el, { yPercent: amount * 100, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });
}

export { gsap, ScrollTrigger };
