import { CATEGORIES, PRODUCTS, byId, optsSummary, defaultOpts } from '../data/products.js';
import { visual, catVisual } from '../media.js';
import { cart } from '../store/cart.js';
import { wishlist } from '../store/wishlist.js';
import { $, $$, esc, money, heart, FREE_SHIPPING, trapFocus, lockScroll, toast, safeJSON, safeSave } from '../utils.js';

const counts = Object.fromEntries(CATEGORIES.map(c => [c.id, PRODUCTS.filter(p => p.category === c.id).length]));

export function renderChrome() {
  $('#header-root').innerHTML = `
    <header class="site-header" id="site-header">
      <a class="wordmark" href="#/" aria-label="NOVA home">NOVA<span class="wordmark-dot">.</span></a>
      <nav class="desktop-nav" id="desktop-nav" aria-label="Main">
        <div class="nav-item has-drop">
          <a href="#/shop" aria-haspopup="true">Shop</a>
          <div class="mega">
            <div class="mega-inner">
              ${CATEGORIES.map(c => `<a href="#/shop?cat=${c.id}"><span class="mega-art">${catVisual(c.id, 'front')}</span><span class="mega-text"><strong>${c.name}</strong><small>${counts[c.id]} objects</small></span></a>`).join('')}
            </div>
          </div>
        </div>
        <a href="#/shop?sort=new">New arrivals</a>
        <a href="#/product/aura-one">Flagship</a>
        <a href="#/?s=story">Philosophy</a>
      </nav>
      <div class="header-actions">
        <button class="icon-button" type="button" id="search-open" aria-label="Search products"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.800" cy="10.800" r="6.800"/><path d="m16 16 5 5"/></svg></button>
        <a class="icon-button wish-link" href="#/wishlist" aria-label="Wishlist"><span class="heart-icon">${heart}</span><span class="count" data-wish-count>0</span></a>
        <button class="icon-button bag-button" type="button" id="cart-open" aria-label="Open shopping bag"><span>Bag</span><span class="count" data-cart-count>0</span></button>
        <button class="menu-toggle" type="button" id="menu-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu"><span></span><span></span></button>
      </div>
    </header>
    <div class="mobile-menu" id="mobile-menu" aria-hidden="true">
      <nav aria-label="Mobile">
        ${CATEGORIES.map((c, i) => `<a href="#/shop?cat=${c.id}" style="--i:${i}"><span class="n">0${i + 1}</span>${c.name}</a>`).join('')}
        <a class="minor" href="#/shop?sort=new" style="--i:5">New arrivals</a>
        <a class="minor" href="#/wishlist" style="--i:6">Wishlist</a>
        <a class="minor" href="#/?s=story" style="--i:7">Philosophy</a>
      </nav>
    </div>`;

  $('#footer-root').innerHTML = `
    <footer class="site-footer">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="wordmark" href="#/">NOVA<span class="wordmark-dot">.</span></a>
          <p class="serif">Technology, reimagined.</p>
          <form class="newsletter" id="newsletter" novalidate>
            <label for="news-email" class="eyebrow">Join the NOVA list</label>
            <div class="news-row"><input id="news-email" type="email" placeholder="Email address" autocomplete="email" required><button class="btn small" type="submit">Subscribe</button></div>
            <p class="form-note" id="news-note" role="status" aria-live="polite">New objects and quiet updates. No noise.</p>
          </form>
        </div>
        <nav class="footer-col" aria-label="Shop"><h4 class="eyebrow">Shop</h4>${CATEGORIES.map(c => `<a href="#/shop?cat=${c.id}">${c.name}</a>`).join('')}<a href="#/shop?sort=new">New arrivals</a></nav>
        <nav class="footer-col" aria-label="Company"><h4 class="eyebrow">NOVA</h4><a href="#/?s=story">Philosophy</a><a href="#/product/aura-one">Flagship</a><a href="#/wishlist">Wishlist</a><a href="#/checkout">Checkout</a></nav>
        <div class="footer-col"><h4 class="eyebrow">Store</h4><p>NOVA Studio<br>Showroom by appointment<br>Mon–Sat, 10:00–18:00</p><p>Complimentary shipping on orders over ${money(FREE_SHIPPING)}. 30-day returns. 2-year warranty.</p></div>
      </div>
      <div class="footer-bottom"><span>© 2026 NOVA STUDIO · DEMONSTRATION STORE</span><span>NO REAL ORDERS ARE PROCESSED</span><button type="button" class="back-top" data-scroll="top">BACK TO TOP ↑</button></div>
    </footer>`;

  $('#overlays-root').innerHTML = `
    <div class="overlay" id="overlay"></div>
    <aside class="drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping bag" aria-hidden="true">
      <div class="drawer-head"><div><p class="eyebrow">Your selection</p><h2>Your bag <span class="count" data-cart-count>0</span></h2></div><button class="drawer-close" type="button" data-close aria-label="Close bag">×</button></div>
      <div class="ship-progress" id="ship-progress"></div>
      <div class="drawer-items" id="cart-items"></div>
      <div class="drawer-foot" id="cart-foot"></div>
    </aside>
    <div class="search-panel" id="search-panel" role="dialog" aria-modal="true" aria-label="Search" aria-hidden="true">
      <button class="drawer-close" type="button" data-close aria-label="Close search">×</button>
      <p class="eyebrow">What are you looking for?</p>
      <input id="search-input" type="search" placeholder="Search objects" autocomplete="off" aria-label="Search objects">
      <div id="search-results" class="search-results" aria-live="polite"></div>
    </div>`;
  bind();
}

/* ---------- overlay controller (one overlay at a time) ---------- */
let active = null;
let release = null;
export function openPanel(id) {
  if (active) closePanel(true);
  const el = $('#' + id);
  active = el;
  el.classList.add('open');
  el.setAttribute('aria-hidden', 'false');
  $('#overlay').classList.add('visible');
  lockScroll(true);
  release = trapFocus(el, () => closePanel());
  const focus = $('input, [data-close]', el);
  setTimeout(() => focus && focus.focus(), 60);
}
export function closePanel(silent) {
  if (!active) return;
  active.classList.remove('open');
  active.setAttribute('aria-hidden', 'true');
  $('#overlay').classList.remove('visible');
  lockScroll(false);
  if (release) { release(); release = null; }
  active = null;
  if (silent) return;
}

/* ---------- mobile menu ---------- */
function setMenu(open) {
  const t = $('#menu-toggle');
  t.setAttribute('aria-expanded', String(open));
  t.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  $('#mobile-menu').classList.toggle('open', open);
  $('#mobile-menu').setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('menu-open', open);
  lockScroll(open);
}
export const closeMenu = () => setMenu(false);

/* ---------- cart rendering ---------- */
function renderCart() {
  const items = cart.items();
  const subtotal = cart.subtotal();
  const left = Math.max(0, FREE_SHIPPING - subtotal);
  $$('[data-cart-count]').forEach(el => { el.textContent = cart.count(); });
  $('#ship-progress').innerHTML = items.length
    ? `<p>${left ? `You are <strong>${money(left)}</strong> away from complimentary shipping.` : 'Complimentary shipping unlocked.'}</p><div class="bar"><span style="transform:scaleX(${Math.min(1, subtotal / FREE_SHIPPING)})"></span></div>` : '';
  $('#cart-items').innerHTML = items.length ? items.map(i => {
    const p = byId(i.id);
    return `<div class="cart-item">
      <a class="ci-art" href="#/product/${p.id}" data-close-panel>${visual(p, { tone: i.opts.Finish })}</a>
      <div class="ci-info">
        <h3>${esc(p.name)}</h3><span class="ci-opts">${esc(optsSummary(i.opts))}</span>
        <div class="qty" role="group" aria-label="Quantity for ${esc(p.name)}">
          <button type="button" data-qty="${esc(i.key)}" data-delta="-1" aria-label="Decrease quantity">−</button><span aria-live="polite">${i.qty}</span><button type="button" data-qty="${esc(i.key)}" data-delta="1" aria-label="Increase quantity">+</button>
          <button type="button" class="link-btn" data-remove="${esc(i.key)}">Remove</button>
        </div>
      </div>
      <strong class="ci-price">${money(p.price * i.qty)}</strong>
    </div>`;
  }).join('') : `<div class="drawer-empty"><p class="serif">Your bag is waiting for something good.</p><a class="btn" href="#/shop" data-close-panel>Explore the collection</a></div>`;
  $('#cart-foot').innerHTML = items.length
    ? `<div class="subtotal"><span>Subtotal</span><strong>${money(subtotal)}</strong></div><p>Shipping and taxes calculated at checkout.</p><a class="btn block" href="#/checkout" data-close-panel>Continue to checkout <span aria-hidden="true">↗</span></a>` : '';
}

function bumpBag() {
  const b = $('#cart-open');
  b.classList.remove('bump');
  void b.offsetWidth;
  b.classList.add('bump');
}

/* ---------- search ---------- */
function runSearch(q) {
  const out = $('#search-results');
  q = q.trim().toLowerCase();
  if (!q) {
    out.innerHTML = `<p class="hint">Popular</p><div class="chips">${CATEGORIES.map(c => `<a class="chip" href="#/shop?cat=${c.id}" data-close-panel>${c.name}</a>`).join('')}</div>`;
    return;
  }
  const found = PRODUCTS.filter(p => `${p.name} ${p.brand} ${p.category} ${p.tagline} ${p.desc}`.toLowerCase().includes(q)).slice(0, 6);
  out.innerHTML = found.length
    ? found.map(p => `<a class="search-result" href="#/product/${p.id}" data-close-panel><span class="sr-art">${visual(p, { tone: defaultOpts(p).Finish })}</span><span class="sr-name">${esc(p.name)}<small>${esc(p.tagline)}</small></span><strong>${money(p.price)}</strong></a>`).join('') + `<a class="text-link" href="#/shop?q=${encodeURIComponent(q)}" data-close-panel>See all results <span>↗</span></a>`
    : `<p class="hint">No objects found for “${esc(q)}”. Try “keyboard” or “audio”.</p>`;
}

function bind() {
  cart.subscribe(renderCart);
  renderCart();
  wishlist.subscribe(() => { $$('[data-wish-count]').forEach(el => { el.textContent = wishlist.count(); }); });
  $$('[data-wish-count]').forEach(el => { el.textContent = wishlist.count(); });

  $('#cart-open').addEventListener('click', () => openPanel('cart-drawer'));
  $('#search-open').addEventListener('click', () => { openPanel('search-panel'); runSearch($('#search-input').value); });
  $('#search-input').addEventListener('input', e => runSearch(e.target.value));
  $('#overlay').addEventListener('click', () => closePanel());
  $('#menu-toggle').addEventListener('click', () => setMenu($('#menu-toggle').getAttribute('aria-expanded') !== 'true'));
  $('#mobile-menu').addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  document.addEventListener('click', e => {
    if (e.target.closest('[data-close]') || e.target.closest('[data-close-panel]')) closePanel();
    const q = e.target.closest('[data-qty]');
    if (q) { const line = cart.items().find(i => i.key === q.dataset.qty); if (line) cart.setQty(line.key, line.qty + Number(q.dataset.delta)); }
    const r = e.target.closest('[data-remove]');
    if (r) { cart.remove(r.dataset.remove); toast('Removed from your bag'); }
    if (e.target.closest('[data-open-cart]')) openPanel('cart-drawer');
  });

  const header = $('#site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  $('#newsletter').addEventListener('submit', e => {
    e.preventDefault();
    const input = $('#news-email');
    const note = $('#news-note');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
      note.textContent = 'Please enter a valid email address.';
      input.setAttribute('aria-invalid', 'true');
      return;
    }
    input.removeAttribute('aria-invalid');
    const list = safeJSON('nova-newsletter', []);
    if (!list.includes(input.value.trim())) safeSave('nova-newsletter', [...list, input.value.trim()]);
    note.textContent = 'Thank you. You are on the list (saved locally in this demo).';
    input.value = '';
    toast('Welcome to the NOVA list');
  });
}

export { bumpBag };
