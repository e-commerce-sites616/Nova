import { gsap, ScrollTrigger, mountMotion, EASE, DUR, reducedMotion } from './motion/index.js';
import { renderChrome, closePanel, closeMenu, openPanel, bumpBag } from './components/chrome.js';
import { home } from './views/home.js';
import { shop } from './views/shop.js';
import { product, notFound } from './views/product.js';
import { wishlistView } from './views/wishlist.js';
import { checkout } from './views/checkout.js';
import { byId, defaultOpts } from './data/products.js';
import { art } from './art/products.js';
import { visual } from './media.js';
import { cart } from './store/cart.js';
import { wishlist } from './store/wishlist.js';
import { $, $$, toast } from './utils.js';

history.scrollRestoration = 'manual';
const motionOn = !reducedMotion();

const ROUTES = [
  [/^\/$/, () => home()],
  [/^\/shop$/, (m, q) => shop(q)],
  [/^\/product\/([\w-]+)$/, (m, q) => product(m[1], q)],
  [/^\/wishlist$/, () => wishlistView()],
  [/^\/checkout$/, () => checkout()]
];

let ctx = null;
let cleanup = null;
let lastPath = null;
let token = 0;

const parse = () => {
  const raw = location.hash.slice(1) || '/';
  const [path, qs = ''] = raw.split('?');
  return { path, params: new URLSearchParams(qs) };
};
const scrollToSection = id => {
  const el = document.getElementById(id);
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: motionOn ? 'smooth' : 'auto' });
};

async function navigate() {
  const { path, params } = parse();
  const section = params.get('s');
  if (path === '/' && lastPath === '/' && section) { scrollToSection(section); return; }
  if (path === lastPath && path === '/shop') return;
  const run = ++token;
  const app = $('#app');

  closePanel(true);
  closeMenu();
  if (lastPath !== null && motionOn) await gsap.to(app, { opacity: 0, duration: DUR.fast * 0.6, ease: EASE.in });
  if (run !== token) return;

  if (cleanup) { cleanup(); cleanup = null; }
  if (ctx) { ctx.revert(); ctx = null; }

  const match = ROUTES.map(([re, make]) => { const m = path.match(re); return m ? make(m, params) : null; }).find(Boolean) || notFound();
  app.innerHTML = match.html;
  window.scrollTo(0, 0);
  document.title = path.startsWith('/product/') && byId(path.split('/')[2]) ? `${byId(path.split('/')[2]).name} — NOVA` : 'NOVA — Technology, Reimagined';

  ctx = gsap.context(() => {
    try {
      mountMotion(app);
      cleanup = match.mount ? match.mount(app, params) || null : null;
    } catch (err) {
      console.error('View failed to animate, showing static content', err);
    }
  }, app);

  if (motionOn) gsap.fromTo(app, { opacity: 0 }, { opacity: 1, duration: DUR.base * 0.7, ease: EASE.soft, clearProps: 'opacity' });
  ScrollTrigger.refresh();
  lastPath = path;
  if (section) requestAnimationFrame(() => scrollToSection(section));
  $('#main').focus({ preventScroll: true });
}

/* global delegated actions */
document.addEventListener('click', e => {
  const wish = e.target.closest('[data-wish]');
  if (wish) {
    e.preventDefault();
    const id = wish.dataset.wish;
    const saved = wishlist.toggle(id);
    toast(saved ? `${byId(id).name} saved to your wishlist` : `${byId(id).name} removed from your wishlist`, saved ? { label: 'View', attr: 'onclick="location.hash=\'#/wishlist\'"' } : null);
    return;
  }
  const dot = e.target.closest('[data-dot]');
  if (dot) { paintCard(dot); return; }
  const quick = e.target.closest('[data-quick]');
  if (quick) {
    const p = byId(quick.dataset.quick);
    const chosen = quick.closest('.card')?.dataset.finish;
    cart.add(p.id, { ...defaultOpts(p), ...(chosen ? { Finish: chosen } : {}) }, 1);
    bumpBag();
    toast(`${p.name} added to your bag`, { label: 'View bag', attr: 'data-open-cart' });
    return;
  }
  const scroll = e.target.closest('[data-scroll]');
  if (scroll) {
    const target = scroll.dataset.scroll;
    if (target === 'top') window.scrollTo({ top: 0, behavior: motionOn ? 'smooth' : 'auto' });
    else scrollToSection(target.slice(1));
  }
});

/* colour dots on a product card swap the photo in place */
function paintCard(dot) {
  const card = dot.closest('.card');
  const p = byId(dot.dataset.dot);
  if (!card || !p || card.dataset.finish === dot.dataset.finish) return;
  const tone = dot.dataset.finish;
  card.dataset.finish = tone;
  const a1 = $('.a1', card), a2 = $('.a2', card);
  a1.innerHTML = visual(p, { tone, angle: 'front', label: p.name });
  a2.innerHTML = visual(p, { tone, angle: 'tilt' });
  $$('[data-dot]', card).forEach(d => d.setAttribute('aria-pressed', String(d === dot)));
  if (motionOn) gsap.fromTo(a1, { opacity: 0.2 }, { opacity: 1, duration: DUR.fast, ease: EASE.out, clearProps: 'opacity' });
}
document.addEventListener('mouseover', e => {
  const dot = e.target.closest('[data-dot]');
  if (dot && window.matchMedia('(hover: hover)').matches) paintCard(dot);
});

wishlist.subscribe(() => {
  $$('[data-wish]').forEach(b => {
    const on = wishlist.has(b.dataset.wish);
    b.setAttribute('aria-pressed', String(on));
    b.setAttribute('aria-label', `${on ? 'Remove from' : 'Add to'} wishlist: ${byId(b.dataset.wish).name}`);
  });
});

// A photo that fails to load falls back to the SVG render for the same product.
document.addEventListener('error', e => {
  const el = e.target;
  if (el && el.tagName === 'IMG' && el.classList.contains('photo')) el.outerHTML = art(el.dataset.type, el.dataset.tone, el.dataset.angle, el.alt);
}, true);

const finishBoot = () => {
  document.body.classList.remove('booting');
  const boot = document.getElementById('boot');
  if (boot) { boot.classList.add('done'); setTimeout(() => boot.remove(), 450); }
};

try {
  if (motionOn) document.documentElement.classList.add('motion');
  renderChrome();
  window.addEventListener('hashchange', navigate);
  navigate().finally(finishBoot);
} catch (err) {
  console.error(err);
  finishBoot();
}
