import { PRODUCTS, CATEGORIES } from '../data/products.js';
import { card } from '../components/card.js';
import { gsap, EASE, DUR, STAGGER, reducedMotion } from '../motion/index.js';
import { $, $$, esc } from '../utils.js';

const SORTS = { featured: 'Featured', new: 'Newest', 'price-asc': 'Price: low to high', 'price-desc': 'Price: high to low', name: 'Name: A to Z' };

function query(state) {
  const q = state.q.trim().toLowerCase();
  const list = PRODUCTS.filter(p => (state.cat === 'all' || p.category === state.cat) &&
    (!q || `${p.name} ${p.brand} ${p.category} ${p.tagline} ${p.desc}`.toLowerCase().includes(q)));
  const score = p => (p.featured ? 2 : 0) + (p.bestseller ? 1 : 0);
  const sorters = {
    featured: (a, b) => score(b) - score(a),
    new: (a, b) => Number(b.isNew) - Number(a.isNew),
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    name: (a, b) => a.name.localeCompare(b.name)
  };
  return list.sort(sorters[state.sort] || sorters.featured);
}

export function shop(params) {
  const state = {
    cat: CATEGORIES.some(c => c.id === params.get('cat')) ? params.get('cat') : 'all',
    sort: SORTS[params.get('sort')] ? params.get('sort') : 'featured',
    q: params.get('q') || ''
  };
  const count = cat => (cat === 'all' ? PRODUCTS.length : PRODUCTS.filter(p => p.category === cat).length);

  const html = `
  <section class="page-head">
    <p class="eyebrow" data-reveal>The collection</p>
    <h1 data-lines><span class="line"><span>All <em>objects.</em></span></span></h1>
  </section>
  <section class="shop">
    <div class="shop-bar">
      <div class="chips" role="group" aria-label="Filter by category">
        ${[{ id: 'all', name: 'All' }, ...CATEGORIES].map(c => `<button type="button" class="chip" data-cat="${c.id}" aria-pressed="${state.cat === c.id}">${c.name}<small>${String(count(c.id)).padStart(2, '0')}</small></button>`).join('')}
      </div>
      <div class="shop-tools">
        <label class="field-inline"><span class="sr-only">Search the collection</span><input id="shop-q" type="search" placeholder="Search" value="${esc(state.q)}" autocomplete="off"></label>
        <label class="field-inline"><span class="sr-only">Sort products</span><select id="shop-sort">${Object.entries(SORTS).map(([k, v]) => `<option value="${k}" ${state.sort === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
      </div>
    </div>
    <p class="result-count" id="shop-count" role="status" aria-live="polite"></p>
    <div class="grid" id="shop-grid"></div>
  </section>`;

  function mount(root) {
    const grid = $('#shop-grid', root);
    const counter = $('#shop-count', root);
    const render = animate => {
      const list = query(state);
      counter.textContent = `${list.length} ${list.length === 1 ? 'object' : 'objects'}`;
      grid.innerHTML = list.length
        ? list.map(p => card(p, { reveal: false })).join('')
        : `<div class="empty"><p class="serif">Nothing matches that yet.</p><button class="btn" type="button" data-reset>Clear filters</button></div>`;
      if (animate && !reducedMotion()) gsap.fromTo(grid.children, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: DUR.base, stagger: STAGGER * 0.6, ease: EASE.out, clearProps: 'transform,opacity' });
      const p = new URLSearchParams();
      if (state.cat !== 'all') p.set('cat', state.cat);
      if (state.sort !== 'featured') p.set('sort', state.sort);
      if (state.q) p.set('q', state.q);
      history.replaceState(null, '', '#/shop' + (p.toString() ? '?' + p : ''));
    };
    render(false);
    if (!reducedMotion()) gsap.fromTo(grid.children, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: DUR.base, stagger: STAGGER * 0.6, ease: EASE.out, delay: 0.25, clearProps: 'transform,opacity' });

    $$('[data-cat]', root).forEach(b => b.addEventListener('click', () => {
      state.cat = b.dataset.cat;
      $$('[data-cat]', root).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      render(true);
    }));
    $('#shop-sort', root).addEventListener('change', e => { state.sort = e.target.value; render(true); });
    $('#shop-q', root).addEventListener('input', e => { state.q = e.target.value; render(true); });
    grid.addEventListener('click', e => {
      if (!e.target.closest('[data-reset]')) return;
      state.cat = 'all'; state.q = ''; state.sort = 'featured';
      $('#shop-q', root).value = ''; $('#shop-sort', root).value = 'featured';
      $$('[data-cat]', root).forEach(x => x.setAttribute('aria-pressed', String(x.dataset.cat === 'all')));
      render(true);
    });
  }
  return { html, mount };
}
