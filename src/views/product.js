import { PRODUCTS, byId, categoryName, defaultOpts, optLabel, statusLabel } from '../data/products.js';
import { TONES } from '../art/products.js';
import { visual, photosFor } from '../media.js';
import { card } from '../components/card.js';
import { cart } from '../store/cart.js';
import { wishlist } from '../store/wishlist.js';
import { openPanel, bumpBag } from '../components/chrome.js';
import { filmSection, mountFilm } from '../components/film.js';
import { gsap, EASE, DUR, reducedMotion } from '../motion/index.js';
import { $, $$, esc, money, heart, toast } from '../utils.js';
import { icon } from '../components/icons.js';

const ANGLES = [['front', 'Front'], ['tilt', 'Profile'], ['detail', 'Detail']];
const PHOTO_LABELS = ['Studio', 'Detail', 'Close-up'];

export function notFound() {
  return { html: `<section class="page-head"><p class="eyebrow">404</p><h1><span class="line"><span>Not <em>found.</em></span></span></h1><p class="muted">That page has moved or never existed.</p><a class="btn" href="#/shop">Back to the collection</a></section>` };
}

export function product(id, params) {
  const p = byId(id);
  if (!p) return notFound();
  const state = { opts: defaultOpts(p), qty: 1, angle: 0 };
  const wanted = params?.get?.('finish');
  if (wanted && (p.options.Finish || []).includes(wanted)) state.opts.Finish = wanted;
  const related = [...PRODUCTS.filter(x => x.id !== p.id && x.category === p.category), ...PRODUCTS.filter(x => x.id !== p.id && x.category !== p.category && x.bestseller)].slice(0, 3);

  const groups = Object.entries(p.options).filter(([, values]) => values.length > 1).map(([group, values]) => `
    <div class="opt" data-group="${group}">
      <div class="opt-label"><span class="eyebrow">${group}</span><b data-value>${optLabel(group, state.opts[group])}</b></div>
      <div class="opt-row" role="radiogroup" aria-label="${group}">
        ${values.map((v, i) => group === 'Finish'
          ? `<button type="button" class="swatch" role="radio" aria-checked="${v === state.opts[group]}" data-v="${v}" aria-label="${TONES[v].name}" style="--c:${TONES[v].body}"></button>`
          : `<button type="button" class="pill" role="radio" aria-checked="${v === state.opts[group]}" data-v="${v}">${v}</button>`).join('')}
      </div>
    </div>`).join('');

  const html = `
  <article class="pdp">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span>/</span><a href="#/shop?cat=${p.category}">${categoryName(p.category)}</a><span>/</span><span aria-current="page">${esc(p.name)}</span></nav>
    <div class="pdp-grid">
      <div class="pdp-gallery" id="gallery" tabindex="0" aria-label="Product gallery. Use left and right arrow keys to change angle.">
        <div class="pg-stage" id="pg-stage" aria-live="polite"></div>
        <button class="pg-nav prev" type="button" data-nav="-1" aria-label="Previous angle">${icon('arrowLeft')}</button>
        <button class="pg-nav next" type="button" data-nav="1" aria-label="Next angle">${icon('arrowRight')}</button>
        <div class="pg-thumbs" id="pg-thumbs" role="group" aria-label="Product angles"></div>
      </div>
      <div class="pdp-info">
        <p class="eyebrow">${esc(p.brand)} · ${categoryName(p.category)}</p>
        <h1>${esc(p.name)}</h1>
        <p class="tagline">${esc(p.tagline)}</p>
        <div class="pdp-price"><strong>${money(p.price)}</strong><span class="stock ${p.status}">${statusLabel(p)}</span></div>
        <p class="pdp-desc">${esc(p.desc)}</p>
        ${groups}
        <div class="buy-row">
          <div class="qty big" role="group" aria-label="Quantity"><button type="button" data-q="-1" aria-label="Decrease quantity">${icon('minus')}</button><span id="qty-val" aria-live="polite">1</span><button type="button" data-q="1" aria-label="Increase quantity">${icon('plus')}</button></div>
          <button class="btn grow" type="button" id="add-btn">${icon('bag')}<span id="add-label">${p.status === 'preorder' ? 'Pre-order' : 'Add to bag'} — <i id="line-total">${money(p.price)}</i></span></button>
          <button class="wish solo" type="button" data-wish="${p.id}" aria-pressed="${wishlist.has(p.id)}" aria-label="${wishlist.has(p.id) ? 'Remove from' : 'Add to'} wishlist: ${esc(p.name)}">${heart}</button>
        </div>
        <ul class="assure"><li>${icon('truck')}Complimentary shipping over $250</li><li>${icon('rotate')}30-day returns</li><li>${icon('shield')}2-year warranty</li></ul>
        <div class="details">
          <details open><summary><span class="sum-t">Specifications</span>${icon('chevronDown', 'chev')}</summary><dl class="specs">${p.specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></details>
          <details><summary><span class="sum-t">${icon('truck')}Shipping and returns</span>${icon('chevronDown', 'chev')}</summary><p>Stocked items dispatch in 1–2 working days. Return any unused object within 30 days for a full refund.</p></details>
          <details><summary><span class="sum-t">${icon('shield')}Warranty and repair</span>${icon('chevronDown', 'chev')}</summary><p>Every NOVA object carries a two-year warranty. Parts are replaceable and repairs are handled by MKSTUDIOS.</p></details>
        </div>
      </div>
    </div>
    ${p.film ? filmSection(p.film) : ''}
    <section class="stories">
      ${p.features.map((f, i) => `<div class="story ${i % 2 ? 'flip' : ''}">
        <div class="story-art" data-reveal="mask">${visual(p, { tone: defaultOpts(p).Finish, angle: i === 1 ? 'tilt' : 'detail', index: i + 1, label: `${p.name} ${f.title}` })}</div>
        <div class="story-copy" data-reveal><h2>${f.title}</h2><p>${f.text}</p></div>
      </div>`).join('')}
    </section>
    <section class="related"><div class="section-head"><div><p class="eyebrow" data-reveal>You may also like</p><h2 data-lines><span class="line"><span>Related <em>objects.</em></span></span></h2></div></div>
      <div class="grid three" data-stagger>${related.map(r => card(r)).join('')}</div></section>
  </article>`;

  function mount(root) {
    const stopFilm = p.film ? mountFilm(root) : null;
    const stage = $('#pg-stage', root);
    const thumbsEl = $('#pg-thumbs', root);
    const tone = () => state.opts.Finish || defaultOpts(p).Finish;
    const frames = () => {
      const photos = photosFor(p, tone()).length > 0;
      const n = photosFor(p, tone()).length || ANGLES.length;
      return Array.from({ length: n }, (_, i) => ({ i, angle: (ANGLES[i] || ANGLES[0])[0], label: photos ? (PHOTO_LABELS[i] || `View ${i + 1}`) : ANGLES[i][1] }));
    };
    const frameHtml = (f, label = '') => visual(p, { tone: tone(), angle: f.angle, index: f.i, label, eager: true });
    const paintThumbs = () => {
      const list = frames();
      thumbsEl.style.setProperty('--n', Math.min(list.length, 5));
      thumbsEl.innerHTML = list.map(f => `<button type="button" data-angle="${f.i}" aria-pressed="${f.i === state.angle}" aria-label="${f.label} view"><span class="pg-thumb">${frameHtml(f)}</span><small>${f.label}</small></button>`).join('');
    };
    const paintStage = animate => {
      const list = frames();
      state.angle = Math.min(state.angle, list.length - 1);
      const f = list[state.angle];
      stage.innerHTML = frameHtml(f, `${p.name}, ${f.label.toLowerCase()} view`);
      if (animate && !reducedMotion()) gsap.fromTo(stage.firstChild, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: DUR.base, ease: EASE.out, clearProps: 'transform,opacity' });
    };
    const setAngle = i => {
      const n = frames().length;
      state.angle = (i + n) % n;
      paintThumbs();
      paintStage(true);
    };
    paintThumbs(); paintStage(false);
    if (!reducedMotion()) gsap.fromTo(stage, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: DUR.slow, ease: EASE.out, clearProps: 'transform,opacity' });
    /* cursor-follow zoom (pointer devices only) */
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      stage.addEventListener('mousemove', e => {
        const img = stage.querySelector('.photo');
        if (!img) return;
        const r = stage.getBoundingClientRect();
        img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
        img.style.transform = 'scale(1.5)';
      });
      stage.addEventListener('mouseleave', () => { const img = stage.querySelector('.photo'); if (img) img.style.transform = ''; });
    }
    thumbsEl.addEventListener('click', e => { const b = e.target.closest('[data-angle]'); if (b) setAngle(Number(b.dataset.angle)); });
    $$('[data-nav]', root).forEach(b => b.addEventListener('click', () => setAngle(state.angle + Number(b.dataset.nav))));
    $('#gallery', root).addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') setAngle(state.angle + 1);
      if (e.key === 'ArrowLeft') setAngle(state.angle - 1);
    });

    $$('.opt', root).forEach(group => {
      const name = group.dataset.group;
      const buttons = $$('[role=radio]', group);
      buttons.forEach(b => b.addEventListener('click', () => {
        state.opts[name] = b.dataset.v;
        buttons.forEach(x => x.setAttribute('aria-checked', String(x === b)));
        $('[data-value]', group).textContent = optLabel(name, b.dataset.v);
        if (name === 'Finish') { paintThumbs(); paintStage(true); }
      }));
      group.addEventListener('keydown', e => {
        if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
        const i = buttons.findIndex(b => b.getAttribute('aria-checked') === 'true');
        const next = buttons[(i + (e.key === 'ArrowRight' ? 1 : buttons.length - 1)) % buttons.length];
        next.click(); next.focus();
      });
    });

    const qtyVal = $('#qty-val', root);
    const refresh = () => { qtyVal.textContent = state.qty; $('#line-total', root).textContent = money(p.price * state.qty); };
    $$('[data-q]', root).forEach(b => b.addEventListener('click', () => {
      state.qty = Math.max(1, Math.min(10, state.qty + Number(b.dataset.q)));
      refresh();
      if (!reducedMotion()) gsap.fromTo(qtyVal, { y: Number(b.dataset.q) * -8, opacity: 0.2 }, { y: 0, opacity: 1, duration: DUR.fast, ease: EASE.out });
    }));

    const addBtn = $('#add-btn', root);
    let timer;
    addBtn.addEventListener('click', () => {
      cart.add(p.id, { ...state.opts }, state.qty);
      bumpBag();
      addBtn.classList.add('done');
      const label = $('#add-label', root);
      label.textContent = 'Added to bag ✓';
      clearTimeout(timer);
      timer = setTimeout(() => { addBtn.classList.remove('done'); label.innerHTML = `${p.status === 'preorder' ? 'Pre-order' : 'Add to bag'} — <i id="line-total">${money(p.price * state.qty)}</i>`; }, 1800);
      openPanel('cart-drawer');
    });
    return () => { clearTimeout(timer); stopFilm?.(); };
  }
  return { html, mount };
}
