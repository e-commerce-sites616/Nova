import { PRODUCTS, CATEGORIES, byId, defaultOpts, categoryName } from '../data/products.js';
import { visual, catVisual } from '../media.js';
import { card } from '../components/card.js';
import { gsap, ScrollTrigger, EASE, DUR, STAGGER, reducedMotion } from '../motion/index.js';
import { $, $$, money, esc } from '../utils.js';
import { TONES } from '../art/products.js';
import { PIN_QUERY, clamp, keyframes, pinnedScene, videoScrubber, loopWhenVisible, chapterFade } from '../components/scene.js';

const line = t => `<span class="line"><span>${t}</span></span>`;
const flagship = byId('aura-one');
const buds = byId('aura-buds');

/* chapters for the scroll-scrubbed case film (progress ranges are in CHAPTER_RANGES) */
const CASE_CHAPTERS = [
  ['Compact. Colourful. <em>Considered.</em>', 'Five finishes of one precise shape: small enough to forget, finished well enough to notice.'],
  ['A case that <em>opens like a ritual.</em>', 'A soft-touch shell with a light bar that shows charge at a glance, and up to 45 hours of playback in your pocket.'],
  ['Quiet, on <em>your terms.</em>', 'Adaptive noise cancelling up to 42 dB, with 10 mm drivers tuned to keep vocals clear at any volume.']
];
const CASE_RANGES = [[0, 0.4], [0.4, 0.72], [0.72, 1]];

/* finish chapters for the colours film: scroll progress -> video seconds, with holds on each finish */
const FINISH_ORDER = ['graphite', 'bone', 'moss', 'sky', 'blush'];
const COLOUR_TIME = [[0, 0], [0.18, 2.0], [0.28, 2.55], [0.3, 2.7], [0.38, 2.7], [0.42, 3.2], [0.5, 3.2], [0.54, 3.7], [0.62, 3.7], [0.66, 4.2], [0.74, 4.2], [0.78, 4.7], [0.86, 4.7], [0.92, 5.2], [1, 5.7]];
const COLOUR_RANGES = { graphite: [0.28, 0.4], bone: [0.4, 0.52], moss: [0.52, 0.64], sky: [0.64, 0.76], blush: [0.76, 0.88] };

export function home() {
  const featured = PRODUCTS.filter(p => p.featured && !p.flagship).slice(0, 3);
  const arrivals = PRODUCTS.filter(p => p.isNew);
  const sellers = PRODUCTS.filter(p => p.bestseller).slice(0, 6);
  const tiles = ['audio', 'keyboards', 'mice', 'controllers', 'smart-desk'];

  const html = `
  <section class="hero" id="hero">
    <div class="hero-bg" data-hero-bg></div><div class="hero-grain"></div>
    <div class="hero-copy">
      <p class="eyebrow" data-hero>The Aura One · Edition 001</p>
      <h1 class="hero-title" data-hero-title>${line('Make room')}${line('for <em>better.</em>')}</h1>
      <p class="hero-sub" data-hero>Considered technology. Exceptional by design.<br>Meet the objects shaping what comes next.</p>
      <div class="hero-cta" data-hero><a class="btn" href="#/product/aura-one">Discover Aura One</a><a class="text-link" href="#/shop">Explore the collection <span>↗</span></a></div>
    </div>
    <div class="hero-stage" data-hero-stage>
      <div class="hero-ring r1"></div><div class="hero-ring r2"></div>
      <div class="hero-art" data-parallax="0.06">${visual(flagship, { tone: 'graphite', label: 'Aura One wireless headphones', eager: true })}</div>
      <div class="hero-swatches" role="radiogroup" aria-label="Aura One finish" data-hero>${flagship.options.Finish.map((f, i) => `<button type="button" class="swatch mini" role="radio" aria-checked="${i === 0}" data-hero-finish="${f}" aria-label="${TONES[f].name}" style="--c:${TONES[f].body}"></button>`).join('')}</div>
      <div class="hero-label"><span id="hero-name">01 / Aura One — ${TONES.graphite.name}</span><span>Form meets function</span></div>
    </div>
    <button class="hero-scroll" type="button" data-scroll="#intro" data-hero><span>Scroll to discover</span><i class="scroll-line"></i></button>
    <div class="hero-index" data-hero>N° 001 — 2026</div>
  </section>

  <section class="intro" id="intro">
    <p class="eyebrow">A different point of view</p>
    <div class="intro-layout">
      <h2 data-lines>${line('Technology should feel')}${line('as good as it <em>works.</em>')}</h2>
      <p class="intro-note" data-reveal>We look beyond the spec sheet. NOVA brings together thoughtful objects, purposeful engineering and details worth noticing.</p>
    </div>
  </section>

  <section class="scrub" id="reveal" aria-label="Aura Buds in motion">
    <div class="scrub-sticky" data-sticky>
      <video class="scrub-video" src="/video/buds-case.mp4" poster="/video/buds-case.jpg" data-duration="5.1" muted playsinline loop preload="auto" disablepictureinpicture tabindex="-1" aria-hidden="true"></video>
      <div class="scrub-shade"></div>
      <div class="scrub-copy">
        <p class="eyebrow">Aura Buds · In motion</p>
        <div class="scrub-chapters">
          ${CASE_CHAPTERS.map(([t, d], i) => `<article class="scrub-chapter"><span class="num">0${i + 1} / 03</span><h2>${t}</h2><p>${d}</p></article>`).join('')}
        </div>
        <a class="btn" href="#/product/aura-buds">Discover Aura Buds — ${money(buds.price)}</a>
        <div class="scrub-progress" aria-hidden="true"><span></span></div>
      </div>
    </div>
  </section>

  <section class="section featured" id="featured">
    <div class="section-head"><div><p class="eyebrow" data-reveal>The featured collection</p><h2 data-lines>${line('Quietly')}${line('<em>extraordinary.</em>')}</h2></div><a class="text-link" href="#/shop" data-reveal>View all objects <span>↗</span></a></div>
    <div class="editorial">
      ${featured.map((p, i) => `<a class="ed ed-${i + 1}" href="#/product/${p.id}">
        <span class="ed-art" data-reveal="mask">${visual(p, { tone: defaultOpts(p).Finish, angle: 'front', label: p.name })}</span>
        <span class="ed-meta" data-reveal><small>0${i + 1} — ${categoryName(p.category)}</small><b>${esc(p.name)}</b><em>${esc(p.tagline)}</em><span class="ed-price">${money(p.price)} <i>↗</i></span></span>
      </a>`).join('')}
    </div>
  </section>

  <section class="section arrivals" id="arrivals">
    <div class="section-head"><div><p class="eyebrow" data-reveal>New arrivals</p><h2 data-lines>${line('Just <em>landed.</em>')}</h2></div>
      <div class="track-ctrl" data-reveal><button type="button" data-track="-1" aria-label="Previous products">←</button><button type="button" data-track="1" aria-label="Next products">→</button></div></div>
    <div class="track" id="arrivals-track" tabindex="0" aria-label="New arrivals, scrollable">${arrivals.map(p => card(p, { reveal: false })).join('')}</div>
  </section>

  <section class="colours" id="colours" aria-label="Aura Buds finishes">
    <div class="colours-sticky" data-sticky>
      <div class="colours-head">
        <div><p class="eyebrow">Aura Buds · Finishes</p><h2>Choose your <em>finish.</em></h2></div>
        <a class="text-link" id="colour-link" href="#/product/aura-buds">Shop Aura Buds <span>↗</span></a>
      </div>
      <div class="colours-stage"><video class="colours-video" src="/video/buds-colours.mp4" poster="/video/buds-colours.jpg" data-duration="5.77" muted playsinline loop preload="auto" disablepictureinpicture tabindex="-1" aria-hidden="true"></video></div>
      <div class="colours-foot">
        <div class="colour-chips" role="group" aria-label="Aura Buds finishes">${FINISH_ORDER.map(f => `<button type="button" class="colour-chip" data-finish="${f}" aria-pressed="false" style="--c:${TONES[f].body}"><i></i>${TONES[f].name}</button>`).join('')}</div>
        <div class="scrub-progress" aria-hidden="true"><span></span></div>
      </div>
    </div>
  </section>

  <section class="experience" id="experience">
    <div class="exp-head"><p class="eyebrow" data-reveal>The NOVA experience</p><h2 data-lines>${line('Made for people who')}${line('notice the <em>details.</em>')}</h2></div>
    <div class="pillars" data-stagger>
      <article data-reveal><span class="num">01</span><h3>Precision</h3><p>Aluminium milled to tight tolerances and tuned drivers measured against a reference. Specifications are the beginning of the conversation.</p></article>
      <article data-reveal><span class="num">02</span><h3>Restraint</h3><p>We remove until only what matters remains. Nothing decorative, nothing loud: objects that sit quietly and perform beautifully.</p></article>
      <article data-reveal><span class="num">03</span><h3>Longevity</h3><p>Repairable construction, replaceable parts and a two-year warranty. We design products to be kept, not replaced.</p></article>
    </div>
    <dl class="stats" data-stagger><div data-reveal><dt>2 yr</dt><dd>Warranty on every object</dd></div><div data-reveal><dt>30 day</dt><dd>Effortless returns</dd></div><div data-reveal><dt>1–2 day</dt><dd>Dispatch on stocked items</dd></div></dl>
  </section>

  <section class="spotlight" id="spotlight">
    <div class="spot-sticky">
      <div class="spot-copy">
        <p class="eyebrow">Flagship spotlight</p>
        <h2>Aura <em>One.</em></h2>
        <div class="spot-panels">
          ${flagship.features.map((f, i) => `<article class="spot-panel"><span class="num">0${i + 1} / 03</span><h3>${f.title}</h3><p>${f.text}</p></article>`).join('')}
        </div>
        <a class="btn" href="#/product/aura-one">Explore Aura One — ${money(flagship.price)}</a>
        <div class="spot-progress" aria-hidden="true"><span></span></div>
      </div>
      <div class="spot-stage"><div class="spot-glow"></div><div class="spot-art">${visual(flagship, { tone: 'graphite', label: 'Aura One close-up' })}</div></div>
    </div>
  </section>

  <section class="section categories" id="categories">
    <div class="section-head"><div><p class="eyebrow" data-reveal>Explore categories</p><h2 data-lines>${line('Find your')}${line('<em>frequency.</em>')}</h2></div></div>
    <div class="mosaic" data-stagger>
      ${tiles.map((id, i) => { const c = CATEGORIES.find(x => x.id === id); const n = PRODUCTS.filter(p => p.category === id).length;
        return `<a class="tile t${i + 1}" href="#/shop?cat=${id}" data-reveal><span class="tile-art">${catVisual(id, 'front')}</span><span class="tile-text"><small>${String(n).padStart(2, '0')} objects</small><b>${c.name}</b><em>${c.blurb}</em></span><i class="tile-arrow" aria-hidden="true">↗</i></a>`; }).join('')}
    </div>
  </section>

  <section class="section sellers" id="sellers">
    <div class="section-head"><div><p class="eyebrow" data-reveal>Best sellers</p><h2 data-lines>${line('The ones')}${line('everyone <em>keeps.</em>')}</h2></div></div>
    <div class="sellers-layout">
      <ol class="seller-list" data-stagger>
        ${sellers.map((p, i) => `<li data-reveal><a href="#/product/${p.id}" data-preview="${p.id}"><span class="rank">${String(i + 1).padStart(2, '0')}</span><span class="s-name">${esc(p.name)}<small>${esc(p.tagline)}</small></span><span class="s-cat">${categoryName(p.category)}</span><strong>${money(p.price)}</strong></a></li>`).join('')}
      </ol>
      <div class="seller-preview" aria-hidden="true"><div class="sp-art" id="sp-art">${visual(sellers[0], { tone: defaultOpts(sellers[0]).Finish })}</div></div>
    </div>
  </section>

  <section class="statement has-film" id="statement">
    <video class="statement-video" src="/video/lifestyle-film.mp4" poster="/video/lifestyle-film.jpg" muted loop playsinline preload="none" disablepictureinpicture aria-hidden="true" tabindex="-1"></video>
    <div class="statement-shade"></div>
    <h2 data-lines>${line('Technology,')}${line('<em>reimagined.</em>')}</h2>
    <p data-reveal>Good design doesn’t ask for attention. It earns it, through the details you notice and the ones you simply feel.</p>
    <a class="btn" href="#/shop" data-reveal>Enter the collection</a>
    <button type="button" class="sound-toggle" id="statement-sound" aria-pressed="false" aria-label="Turn sound on"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.4L12 6v12l-4.6-3.5H4z"/><path class="on" d="M15.4 9.2a4 4 0 0 1 0 5.6M18 6.6a7.6 7.6 0 0 1 0 10.8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path class="off" d="m15.5 9.5 5 5m0-5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><span>Sound off</span></button>
  </section>`;

  function mount(root) {
    const reduced = reducedMotion();
    const cleanups = [];

    /* hero intro: identity → backdrop settles → headline → product → copy → hint */
    const first = !sessionStorage.getItem('nova-intro');
    try { sessionStorage.setItem('nova-intro', '1'); } catch { /* ignore */ }
    if (!reduced) {
      const tl = gsap.timeline({ defaults: { ease: EASE.out } });
      const siteHeader = document.querySelector('#site-header');
      gsap.set('[data-hero-title] .line > span', { yPercent: 110 });
      gsap.set('[data-hero]', { opacity: 0, y: 20 });
      let t0 = 0;
      if (first) {
        const curtain = document.createElement('div');
        curtain.className = 'curtain';
        curtain.innerHTML = '<span>NOVA<i>.</i></span>';
        document.body.appendChild(curtain);
        gsap.set(siteHeader, { opacity: 0 });
        tl.fromTo(curtain.firstChild, { opacity: 0, y: 14, letterSpacing: '0.2em' }, { opacity: 1, y: 0, letterSpacing: '-0.08em', duration: 1 })
          .to(curtain, { yPercent: -100, duration: DUR.slow, ease: EASE.inOut, onComplete: () => curtain.remove() }, '+=0.35');
        t0 = '>-0.55';
        tl.to(siteHeader, { opacity: 1, duration: DUR.base, clearProps: 'opacity' }, t0);
      }
      tl.fromTo('[data-hero-bg]', { scale: 1.2, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 2, ease: 'power2.out' }, first ? t0 : 0)
        .to('[data-hero-title] .line > span', { yPercent: 0, duration: DUR.slow, stagger: STAGGER * 1.6 }, '<0.2')
        .fromTo('[data-hero-stage]', { opacity: 0, y: 90, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 1.5, clearProps: 'transform' }, '<0.15')
        .fromTo('.hero-ring', { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.8, stagger: 0.15 }, '<0.3')
        .to('[data-hero]', { opacity: 1, y: 0, duration: DUR.base, stagger: STAGGER, clearProps: 'transform' }, '<0.4');
      gsap.to('[data-hero-stage]', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    }

    /* hero colourway switcher */
    const heroArt = $('.hero-art', root);
    $$('[data-hero-finish]', root).forEach(b => b.addEventListener('click', () => {
      const f = b.dataset.heroFinish;
      $$('[data-hero-finish]', root).forEach(x => x.setAttribute('aria-checked', String(x === b)));
      heroArt.innerHTML = visual(flagship, { tone: f, label: `Aura One wireless headphones in ${TONES[f].name}`, eager: true });
      $('#hero-name', root).textContent = `01 / Aura One — ${TONES[f].name}`;
      if (!reduced) gsap.fromTo(heroArt.firstChild, { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: DUR.base, ease: EASE.out, clearProps: 'transform,opacity' });
    }));

    /* new arrivals scroller */
    const track = $('#arrivals-track', root);
    $$('[data-track]', root).forEach(b => b.addEventListener('click', () => {
      const step = (track.querySelector('.card')?.offsetWidth || 300) + 24;
      track.scrollBy({ left: Number(b.dataset.track) * step * 2, behavior: reduced ? 'auto' : 'smooth' });
    }));

    /* best sellers preview */
    const spArt = $('#sp-art', root);
    let current = null;
    $$('[data-preview]', root).forEach(a => {
      const show = () => {
        if (current === a.dataset.preview) return;
        current = a.dataset.preview;
        const p = byId(current);
        spArt.innerHTML = visual(p, { tone: defaultOpts(p).Finish });
        if (!reduced) gsap.fromTo(spArt, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: DUR.fast + 0.1, ease: EASE.soft });
      };
      a.addEventListener('mouseenter', show);
      a.addEventListener('focus', show);
    });

    /* flagship spotlight: scroll-linked product story (desktop); stacked elsewhere */
    const section = $('#spotlight', root);
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
      section.classList.add('is-pinned');
      const panels = $$('.spot-panel', section);
      const art_ = $('.spot-art', section);
      gsap.set(panels, { opacity: 0, y: 36 });
      gsap.set(panels[0], { opacity: 1, y: 0 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: () => 'top ' + (document.getElementById('site-header')?.offsetHeight || 0), end: '+=260%', pin: $('.spot-sticky', section), scrub: 0.6, anticipatePin: 1 }, defaults: { ease: 'none' } });
      tl.to(art_, { scale: 1.05, duration: 1 })
        .to(panels[0], { opacity: 0, y: -36, duration: 0.6 })
        .to(art_, { scale: 1.6, xPercent: 26, yPercent: -2, duration: 1.4 }, '<')
        .to(panels[1], { opacity: 1, y: 0, duration: 0.6 }, '>-0.2')
        .to({}, { duration: 0.8 })
        .to(panels[1], { opacity: 0, y: -36, duration: 0.6 })
        .to(art_, { scale: 1.45, xPercent: -2, yPercent: 20, duration: 1.4 }, '<')
        .to(panels[2], { opacity: 1, y: 0, duration: 0.6 }, '>-0.2')
        .to({}, { duration: 0.8 });
      gsap.to('.spot-progress span', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: section, start: () => 'top ' + (document.getElementById('site-header')?.offsetHeight || 0), end: '+=260%', scrub: true } });
      return () => section.classList.remove('is-pinned');
    });

    /* ---------- film scenes ---------- */
    const pinned = window.matchMedia(PIN_QUERY).matches;

    // 1. the case film: scroll scrubs the video, three chapters fade over it
    const reveal = $('#reveal', root);
    const revealVideo = $('.scrub-video', reveal);
    if (pinned) {
      const scrub = videoScrubber(revealVideo);
      const chapters = $$('.scrub-chapter', reveal);
      const bar = $('.scrub-progress span', reveal);
      const stop = pinnedScene(reveal, p => {
        scrub.seek(p * Math.max(0, scrub.duration - 0.05));
        chapters.forEach((c, i) => chapterFade(c, p, CASE_RANGES[i], { first: i === 0, last: i === chapters.length - 1 }));
        bar.style.transform = `scaleX(${p})`;
      });
      cleanups.push(stop, scrub.destroy);
    } else {
      cleanups.push(loopWhenVisible(revealVideo, { reduced }));
    }

    // 2. the colours film: holds on each finish, chips stay in sync and are clickable
    const colours = $('#colours', root);
    const colourVideo = $('.colours-video', colours);
    const chips = $$('.colour-chip', colours);
    const link = $('#colour-link', colours);
    const setFinish = f => {
      chips.forEach(c => c.setAttribute('aria-pressed', String(c.dataset.finish === f)));
      link.innerHTML = f ? `Shop Aura Buds in ${TONES[f].name} <span>↗</span>` : 'Shop Aura Buds <span>↗</span>';
      link.setAttribute('href', f ? `#/product/aura-buds?finish=${f}` : '#/product/aura-buds');
    };
    if (pinned) {
      const scrub = videoScrubber(colourVideo);
      const bar = $('.scrub-progress span', colours);
      let active;
      const stop = pinnedScene(colours, p => {
        scrub.seek(keyframes(COLOUR_TIME, p) / 5.77 * scrub.duration);
        const f = FINISH_ORDER.find(k => p >= COLOUR_RANGES[k][0] && p < COLOUR_RANGES[k][1]) || null;
        if (f !== active) { active = f; setFinish(f); }
        bar.style.transform = `scaleX(${p})`;
      });
      chips.forEach(c => c.addEventListener('click', () => {
        const [a, b] = COLOUR_RANGES[c.dataset.finish];
        const r = colours.getBoundingClientRect();
        const travel = r.height - $('[data-sticky]', colours).offsetHeight;
        const hdr = document.getElementById('site-header')?.offsetHeight || 0;
        window.scrollTo({ top: window.scrollY + r.top - hdr + travel * ((a + b) / 2), behavior: 'smooth' });
      }));
      cleanups.push(stop, scrub.destroy);
    } else {
      cleanups.push(loopWhenVisible(colourVideo, { reduced }));
      chips.forEach(c => c.addEventListener('click', () => setFinish(c.dataset.finish)));
      colourVideo.addEventListener('timeupdate', () => {
        const t = colourVideo.currentTime;
        const f = [[2.5, 3.05, 'graphite'], [3.05, 3.55, 'bone'], [3.55, 4.05, 'moss'], [4.05, 4.55, 'sky'], [4.55, 5, 'blush']].find(([a, b]) => t >= a && t < b)?.[2] || null;
        setFinish(f);
      });
    }

    // 3. the lifestyle film behind the closing statement: plays only while visible, sound is opt-in
    const statement = $('#statement', root);
    const sv = $('.statement-video', statement);
    const soundBtn = $('#statement-sound', statement);
    if (reduced) { soundBtn.hidden = true; } else {
      const io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { sv.preload = 'auto'; sv.play().catch(() => {}); } else sv.pause();
      }, { threshold: 0.2, rootMargin: '200px 0px' });
      io.observe(statement);
      soundBtn.addEventListener('click', () => {
        sv.muted = !sv.muted;
        soundBtn.setAttribute('aria-pressed', String(!sv.muted));
        soundBtn.setAttribute('aria-label', sv.muted ? 'Turn sound on' : 'Turn sound off');
        $('span', soundBtn).textContent = sv.muted ? 'Sound off' : 'Sound on';
        if (!sv.muted) sv.play().catch(() => {});
      });
      cleanups.push(() => { io.disconnect(); sv.pause(); });
    }

    return () => cleanups.forEach(fn => fn());
  }
  return { html, mount };
}
