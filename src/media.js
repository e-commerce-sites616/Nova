import { art } from './art/products.js';
import { PRODUCTS, defaultOpts } from './data/products.js';
import { PHOTOS, DARK_SURFACE } from './data/photos.js';
import { esc } from './utils.js';

// Files in src/assets/products/<id>/<finish>-<n>.<ext> are bundled by Vite and grouped per product and finish.
const files = import.meta.glob('./assets/products/*/*.{jpg,jpeg,png,webp,avif}', { eager: true, query: '?url', import: 'default' });

const local = {};
Object.entries(files)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .forEach(([path, url]) => {
    const m = path.match(/products\/([^/]+)\/(?:([a-z]+)-)?[^/]+\.\w+$/);
    if (!m) return;
    const slot = (local[m[1]] ??= {});
    (slot[m[2] || 'default'] ??= []).push(url);
  });

const pick = (src, finish) => {
  if (!src) return [];
  if (Array.isArray(src)) return src;
  return src[finish] || src.default || Object.values(src)[0] || [];
};

export function photosFor(p, finish) {
  const manual = pick(PHOTOS[p.id], finish);
  return manual.length ? manual : pick(local[p.id], finish);
}

const ANGLE_INDEX = { front: 0, tilt: 1, detail: 2 };

/**
 * One call renders a product image: a photo when one exists, otherwise the built-in SVG render
 * (main.js also swaps a photo for the SVG if it fails to load).
 * eager: load now instead of lazily.  priority: also hint the browser that this is the LCP image.
 */
export function visual(p, { tone, angle = 'front', index, label = '', eager = false, priority = false } = {}) {
  const finish = tone || defaultOpts(p).Finish;
  const list = photosFor(p, finish);
  if (!list.length) return art(p.art, finish, angle, label);
  const i = (index ?? ANGLE_INDEX[angle] ?? 0) % list.length;
  const surface = DARK_SURFACE.has(p.id) ? 'dark' : 'light';
  return `<img class="art photo" src="${esc(list[i])}" alt="${esc(label)}" ${label ? '' : 'aria-hidden="true"'} loading="${eager ? 'eager' : 'lazy'}" decoding="async"${priority ? ' fetchpriority="high"' : ''} draggable="false" data-type="${p.art}" data-tone="${finish}" data-angle="${angle}" data-surface="${surface}">`;
}

export function catVisual(catId, angle = 'front', tone = 'graphite') {
  const p = PRODUCTS.find(x => x.category === catId && x.bestseller) || PRODUCTS.find(x => x.category === catId);
  const finish = (p.options.Finish || []).includes(tone) ? tone : defaultOpts(p).Finish;
  return visual(p, { tone: finish, angle });
}
