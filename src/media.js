import { art } from './art/products.js';
import { PRODUCTS, defaultOpts } from './data/products.js';
import { PHOTOS, TEST_PHOTOS, DARK_SURFACE } from './data/photos.js';
import { esc } from './utils.js';

// Files dropped into src/assets/products/<id>/ are picked up automatically by Vite.
let files = {};
try { files = import.meta.glob('./assets/products/*/*.{jpg,jpeg,png,webp,avif}', { eager: true, query: '?url', import: 'default' }); } catch { files = {}; }

const local = {};
Object.entries(files).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })).forEach(([path, url]) => {
  const m = path.match(/products\/([^/]+)\/(?:([a-z]+)-)?[^/]+\.\w+$/);
  if (!m) return;
  const slot = (local[m[1]] ??= {});
  (slot[m[2] || 'default'] ??= []).push(url);
});

const KEYWORDS = { headphones: 'headphones', earbuds: 'earbuds', keyboard: 'mechanical,keyboard', mouse: 'computer,mouse', speaker: 'bluetooth,speaker', controller: 'gamepad,controller', lamp: 'desk,lamp' };
const testPhotos = p => {
  const base = PRODUCTS.findIndex(x => x.id === p.id) * 3 + 1;
  return [0, 1, 2].map(n => `https://loremflickr.com/900/900/${KEYWORDS[p.art]}?lock=${base + n}`);
};
const pick = (src, finish) => {
  if (!src) return [];
  if (Array.isArray(src)) return src;
  return src[finish] || src.default || Object.values(src)[0] || [];
};

export function photosFor(p, finish) {
  let list = pick(PHOTOS[p.id], finish);
  if (!list.length) list = pick(local[p.id], finish);
  if (!list.length && TEST_PHOTOS) list = testPhotos(p);
  return list;
}

const ANGLE_INDEX = { front: 0, tilt: 1, detail: 2 };

// One call renders a product image: a photo when available, otherwise the SVG render.
export function visual(p, { tone, angle = 'front', index, label = '', eager = false } = {}) {
  const finish = tone || defaultOpts(p).Finish;
  const list = photosFor(p, finish);
  if (!list.length) return art(p.art, finish, angle, label);
  const i = (index ?? ANGLE_INDEX[angle] ?? 0) % list.length;
  return `<img class="art photo" src="${esc(list[i])}" alt="${esc(label)}" ${label ? '' : 'aria-hidden="true"'} loading="${eager ? 'eager' : 'lazy'}" decoding="async" draggable="false" data-type="${p.art}" data-tone="${finish}" data-angle="${angle}" data-surface="${DARK_SURFACE.has(p.id) ? 'dark' : 'light'}">`;
}

export function catVisual(catId, angle = 'front', tone = 'graphite') {
  const p = PRODUCTS.find(x => x.category === catId && x.bestseller) || PRODUCTS.find(x => x.category === catId);
  const finish = (p.options.Finish || []).includes(tone) ? tone : defaultOpts(p).Finish;
  return visual(p, { tone: finish, angle });
}
