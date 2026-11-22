// Film player used on product pages: poster first, nothing downloads until the visitor presses play,
// then sound plays by default. Custom controls so it matches the rest of the site.
import { esc } from '../utils.js';

const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const I = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6L19 12z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.4v14H7zM13.6 5H17v14h-3.4z"/></svg>',
  sound: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.4L12 6v12l-4.6-3.5H4z"/><path d="M15.4 9.2a4 4 0 0 1 0 5.6M18 6.6a7.6 7.6 0 0 1 0 10.8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  muted: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.4L12 6v12l-4.6-3.5H4z"/><path d="m15.5 9.5 5 5m0-5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  full: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

export function filmSection(film) {
  const { name, title, text } = film;
  return `<section class="film" aria-label="${esc(title.replace(/<[^>]+>/g, ''))}">
    <div class="film-head">
      <div><p class="eyebrow" data-reveal>The film</p><h2 data-lines><span class="line"><span>${title}</span></span></h2></div>
      <p class="film-text" data-reveal>${esc(text)}</p>
    </div>
    <div class="film-frame" data-film data-reveal>
      <video class="film-video" poster="/video/${name}.jpg" preload="metadata" playsinline disablepictureinpicture>
        <source src="/video/${name}.mp4" type="video/mp4">
      </video>
      <button type="button" class="film-play" data-film-play aria-label="Play film">${I.play}<span>Play film</span><small data-film-len></small></button>
      <div class="film-bar" role="group" aria-label="Video controls">
        <button type="button" class="film-btn" data-film-toggle aria-label="Pause">${I.pause}</button>
        <div class="film-progress" data-film-seek role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>
        <span class="film-time" data-film-time>0:00</span>
        <button type="button" class="film-btn" data-film-mute aria-label="Mute">${I.sound}</button>
        <button type="button" class="film-btn" data-film-full aria-label="Fullscreen">${I.full}</button>
      </div>
    </div>
  </section>`;
}

export function mountFilm(root) {
  const frame = root.querySelector('[data-film]');
  if (!frame) return () => {};
  const v = frame.querySelector('video');
  const q = s => frame.querySelector(s);
  const seek = q('[data-film-seek]'), bar = seek.firstElementChild, time = q('[data-film-time]');
  const toggle = q('[data-film-toggle]'), mute = q('[data-film-mute]');

  const sync = () => {
    const playing = !v.paused && !v.ended;
    frame.classList.toggle('is-playing', playing);
    toggle.innerHTML = playing ? I.pause : I.play;
    toggle.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    mute.innerHTML = v.muted ? I.muted : I.sound;
    mute.setAttribute('aria-label', v.muted ? 'Unmute' : 'Mute');
  };
  const start = () => { frame.classList.add('is-started'); v.muted = false; v.play().catch(() => { v.muted = true; v.play().catch(() => {}); }); };
  const flip = () => (v.paused || v.ended ? (v.ended && (v.currentTime = 0), v.play().catch(() => {})) : v.pause());

  const onMeta = () => { const l = q('[data-film-len]'); if (l) l.textContent = fmt(v.duration); };
  const onTime = () => {
    const p = v.duration ? v.currentTime / v.duration : 0;
    bar.style.transform = `scaleX(${p})`;
    seek.setAttribute('aria-valuenow', Math.round(p * 100));
    time.textContent = `${fmt(v.currentTime)} / ${fmt(v.duration || 0)}`;
  };
  const scrub = e => { const r = seek.getBoundingClientRect(); v.currentTime = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * (v.duration || 0); };
  let dragging = false;
  const down = e => { dragging = true; seek.setPointerCapture?.(e.pointerId); scrub(e); };
  const move = e => { if (dragging) scrub(e); };
  const up = () => { dragging = false; };
  const key = e => {
    if (e.key === 'ArrowRight') v.currentTime = Math.min(v.duration, v.currentTime + 5);
    else if (e.key === 'ArrowLeft') v.currentTime = Math.max(0, v.currentTime - 5);
    else return;
    e.preventDefault();
  };
  const full = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (frame.requestFullscreen) frame.requestFullscreen();
    else v.webkitEnterFullscreen?.();
  };

  q('[data-film-play]').addEventListener('click', start);
  toggle.addEventListener('click', flip);
  v.addEventListener('click', () => frame.classList.contains('is-started') && flip());
  mute.addEventListener('click', () => { v.muted = !v.muted; sync(); });
  q('[data-film-full]').addEventListener('click', full);
  seek.addEventListener('pointerdown', down); seek.addEventListener('pointermove', move); seek.addEventListener('pointerup', up); seek.addEventListener('keydown', key);
  ['play', 'pause', 'ended', 'volumechange'].forEach(ev => v.addEventListener(ev, sync));
  v.addEventListener('timeupdate', onTime); v.addEventListener('loadedmetadata', onMeta);
  if (v.readyState >= 1) onMeta();

  // never keep playing off-screen
  const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting && !v.paused && !document.fullscreenElement) v.pause(); }, { threshold: 0.15 });
  io.observe(frame);
  sync();
  return () => { io.disconnect(); v.pause(); };
}
