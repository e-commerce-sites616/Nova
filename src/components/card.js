import { visual } from '../media.js';
import { categoryName, defaultOpts } from '../data/products.js';
import { wishlist } from '../store/wishlist.js';
import { esc, money, heart } from '../utils.js';
import { TONES } from '../art/products.js';

const dots = p => {
  const finishes = p.options.Finish || [];
  if (finishes.length < 2) return '';
  const shown = finishes.slice(0, 5);
  return `<div class="card-dots" role="group" aria-label="Finish">${shown.map((f, i) => `<button type="button" class="dot" data-dot="${p.id}" data-finish="${f}" aria-pressed="${i === 0}" aria-label="${TONES[f].name}" title="${TONES[f].name}" style="--c:${TONES[f].body}"></button>`).join('')}${finishes.length > 5 ? `<small>+${finishes.length - 5}</small>` : ''}</div>`;
};

const badge = p => {
  const text = p.status === 'preorder' ? 'Pre-order' : p.status === 'low' ? 'Low stock' : p.isNew ? 'New' : p.bestseller ? 'Best seller' : '';
  return text ? `<span class="badge">${text}</span>` : '';
};

export function card(p, { reveal = true } = {}) {
  const tone = defaultOpts(p).Finish;
  const wished = wishlist.has(p.id);
  return `<article class="card" data-finish="${tone}" ${reveal ? 'data-reveal' : ''}>
    <div class="card-media">
      <a class="card-link" href="#/product/${p.id}" aria-label="View ${esc(p.name)}">
        <span class="card-art a1">${visual(p, { tone, angle: 'front', label: p.name })}</span>
        <span class="card-art a2">${visual(p, { tone, angle: 'tilt' })}</span>
      </a>
      ${badge(p)}
      <button class="wish" type="button" data-wish="${p.id}" aria-pressed="${wished}" aria-label="${wished ? 'Remove from' : 'Add to'} wishlist: ${esc(p.name)}">${heart}</button>
      <button class="quick" type="button" data-quick="${p.id}"><span>${p.status === 'preorder' ? 'Pre-order' : 'Add to bag'}</span><b aria-hidden="true">+</b></button>
    </div>
    <a class="card-meta" href="#/product/${p.id}">
      <span class="eyebrow">${categoryName(p.category)}</span>
      <h3>${esc(p.name)}</h3>
      <span class="tagline">${esc(p.tagline)}</span>
      <strong class="price">${money(p.price)}</strong>
    </a>
    ${dots(p)}
  </article>`;
}
