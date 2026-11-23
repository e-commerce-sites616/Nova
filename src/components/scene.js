// Scroll scenes: a tall <section> holding a position:sticky stage. We turn scroll position into a 0-1
// progress value (no GSAP pin, no spacer elements) and hand it to a callback. Video scrubbing is
// smoothed with a tiny lerp so scrolling feels like inertia rather than frame-stepping.

export const PIN_QUERY = '(prefers-reduced-motion: no-preference)';
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** Piecewise-linear map through [[progress, value], ...] anchors. Equal values = a "hold". */
export function keyframes(points, p) {
  if (p <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [p1, v1] = points[i];
    if (p <= p1) { const [p0, v0] = points[i - 1]; return v0 + ((p - p0) / (p1 - p0 || 1)) * (v1 - v0); }
  }
  return points[points.length - 1][1];
}

/** Calls onFrame(progress) whenever the scroll position changes. Returns a cleanup function. */
export function pinnedScene(section, onFrame) {
  const sticky = section.querySelector('[data-sticky]');
  let raf = 0, last = -1;
  const headerH = () => document.getElementById('site-header')?.offsetHeight || 0;
  const update = () => {
    raf = 0;
    const r = section.getBoundingClientRect();
    const travel = Math.max(1, r.height - sticky.offsetHeight);
    const p = clamp((headerH() - r.top) / travel);
    if (p !== last) { last = p; onFrame(p); }
  };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();
  return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
}

/** Gives a <video data-src> its source only when it is about to scroll into view (saves megabytes on first load). */
export function lazyVideo(video, { margin = '120% 0px' } = {}) {
  const src = video.dataset.src;
  if (!src || video.getAttribute('src')) return () => {};
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    video.src = src;
    video.load();
  }, { rootMargin: margin });
  io.observe(video);
  return () => io.disconnect();
}

/** Smoothly drives video.currentTime toward a target time. */
export function videoScrubber(video) {
  let target = 0, cur = 0, raf = 0, dur = Number(video.dataset.duration) || 0;
  const meta = () => { dur = video.duration || dur; };
  video.addEventListener('loadedmetadata', meta);
  if (video.readyState >= 1) meta();
  video.muted = true;
  video.pause();
  // iOS Safari won't decode frames for a never-played video, so seeking shows nothing until it has played once.
  // A muted inline play()->pause() "unlocks" it; if the browser blocks that, retry on the first touch.
  let unlocked = false;
  const unlock = () => {
    if (unlocked) return;
    const pr = video.play();
    if (pr && pr.then) pr.then(() => { unlocked = true; video.pause(); }).catch(() => {});
    else { unlocked = true; video.pause(); }
  };
  unlock();
  video.addEventListener('loadeddata', unlock, { once: true });
  const onTouch = () => { unlock(); };
  window.addEventListener('touchstart', onTouch, { passive: true, once: true });
  window.addEventListener('pointerdown', onTouch, { passive: true, once: true });
  const tick = () => {
    raf = 0;
    const d = target - cur;
    cur = Math.abs(d) < 0.004 ? target : cur + d * 0.22;
    if (!video.seeking && Math.abs(video.currentTime - cur) > 1 / 120) video.currentTime = clamp(cur, 0, Math.max(0, dur - 0.04));
    if (cur !== target) raf = requestAnimationFrame(tick);
  };
  return {
    get duration() { return dur; },
    seek(t) { target = t; if (!raf) raf = requestAnimationFrame(tick); },
    destroy() { cancelAnimationFrame(raf); video.removeEventListener('loadedmetadata', meta); window.removeEventListener('touchstart', onTouch); window.removeEventListener('pointerdown', onTouch); }
  };
}

/** Fallback for phones / reduced motion: loop quietly while on screen (poster only if reduced motion). */
export function loopWhenVisible(video, { reduced = false } = {}) {
  if (reduced) { video.removeAttribute('autoplay'); video.pause(); return () => {}; }
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) video.play().catch(() => {}); else video.pause(); }, { threshold: 0.2 });
  io.observe(video);
  return () => { io.disconnect(); video.pause(); };
}

/** Fade/slide a chapter in and out across [a, b] of progress. */
export function chapterFade(el, p, [a, b], { first = false, last = false, edge = 0.05 } = {}) {
  const fin = first ? 1 : clamp((p - a) / edge);
  const fout = last ? 1 : 1 - clamp((p - (b - edge)) / edge);
  const o = Math.min(fin, fout);
  el.style.opacity = o.toFixed(3);
  el.style.transform = `translateY(${((1 - o) * (fout < fin ? -22 : 22)).toFixed(1)}px)`;
  el.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
  el.setAttribute('aria-hidden', String(o < 0.5));
}
