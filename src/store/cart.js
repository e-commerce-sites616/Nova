import { safeJSON, safeSave } from '../utils.js';
import { byId } from '../data/products.js';

const KEY = 'nova-cart-v2';
let items = safeJSON(KEY, []).filter(i => byId(i.id));
const listeners = new Set();
const lineKey = (id, opts) => id + '|' + Object.entries(opts).map(([k, v]) => `${k}:${v}`).join(',');
const emit = () => { safeSave(KEY, items); listeners.forEach(fn => fn()); };

export const cart = {
  items: () => items,
  subscribe: fn => { listeners.add(fn); return () => listeners.delete(fn); },
  count: () => items.reduce((n, i) => n + i.qty, 0),
  subtotal: () => items.reduce((n, i) => n + byId(i.id).price * i.qty, 0),
  add(id, opts, qty = 1) {
    const key = lineKey(id, opts);
    const line = items.find(i => i.key === key);
    if (line) line.qty = Math.min(10, line.qty + qty); else items.push({ key, id, opts, qty });
    emit();
  },
  setQty(key, qty) {
    const line = items.find(i => i.key === key);
    if (!line) return;
    if (qty <= 0) items = items.filter(i => i.key !== key); else line.qty = Math.min(10, qty);
    emit();
  },
  remove(key) { items = items.filter(i => i.key !== key); emit(); },
  clear() { items = []; emit(); }
};
