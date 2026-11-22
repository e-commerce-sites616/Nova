import { byId } from '../data/products.js';
import { card } from '../components/card.js';
import { wishlist } from '../store/wishlist.js';
import { $ } from '../utils.js';

export function wishlistView() {
  const body = () => {
    const list = wishlist.ids().map(byId).filter(Boolean);
    return list.length
      ? `<div class="grid">${list.map(p => card(p, { reveal: false })).join('')}</div>`
      : `<div class="empty"><p class="serif">Nothing saved yet.</p><p class="muted">Tap the heart on any object to keep it here.</p><a class="btn" href="#/shop">Explore the collection</a></div>`;
  };
  const html = `<section class="page-head"><p class="eyebrow">Saved for later</p><h1><span class="line"><span>Your <em>wishlist.</em></span></span></h1></section><section class="shop" id="wish-body">${body()}</section>`;
  function mount(root) {
    return wishlist.subscribe(() => { $('#wish-body', root).innerHTML = body(); });
  }
  return { html, mount };
}
