import { safeJSON, safeSave } from '../utils.js';
import { byId } from '../data/products.js';

const KEY = 'nova-wishlist-v1';
let ids = safeJSON(KEY, []).filter(byId);
const listeners = new Set();

export const wishlist = {
  ids: () => ids,
  has: id => ids.includes(id),
  count: () => ids.length,
  subscribe: fn => { listeners.add(fn); return () => listeners.delete(fn); },
  toggle(id) {
    const saved = !ids.includes(id);
    ids = saved ? [...ids, id] : ids.filter(i => i !== id);
    safeSave(KEY, ids);
    listeners.forEach(fn => fn(id, saved));
    return saved;
  }
};
