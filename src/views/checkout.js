import { byId, optsSummary } from '../data/products.js';
import { visual } from '../media.js';
import { cart } from '../store/cart.js';
import { gsap, EASE, DUR, reducedMotion } from '../motion/index.js';
import { $, $$, esc, money, FREE_SHIPPING, toast } from '../utils.js';

const SHIPPING = 12;
const field = (id, label, attrs = '') => `<div class="field"><label for="${id}">${label}</label><input id="${id}" name="${id}" ${attrs}><span class="err" id="${id}-err" role="alert"></span></div>`;

export function checkout() {
  const lines = () => cart.items().map(i => ({ ...i, p: byId(i.id) }));
  const summary = items => {
    const sub = items.reduce((n, i) => n + i.p.price * i.qty, 0);
    const ship = sub >= FREE_SHIPPING || !sub ? 0 : SHIPPING;
    return { sub, ship, total: sub + ship };
  };
  const summaryHtml = items => {
    const s = summary(items);
    return `<h2>Order summary</h2>
      <ul class="sum-items">${items.map(i => `<li><span class="sum-art">${visual(i.p, { tone: i.opts.Finish })}<b>${i.qty}</b></span><span class="sum-name">${esc(i.p.name)}<small>${esc(optsSummary(i.opts))}</small></span><strong>${money(i.p.price * i.qty)}</strong></li>`).join('')}</ul>
      <dl class="sum-totals"><div><dt>Subtotal</dt><dd>${money(s.sub)}</dd></div><div><dt>Shipping</dt><dd>${s.ship ? money(s.ship) : 'Complimentary'}</dd></div><div class="total"><dt>Total</dt><dd>${money(s.total)}</dd></div></dl>`;
  };

  const html = `<section class="page-head"><p class="eyebrow">Secure checkout (demonstration)</p><h1><span class="line"><span>Checkout.</span></span></h1></section><section class="checkout" id="checkout-root"></section>`;

  function mount(root) {
    const host = $('#checkout-root', root);
    const draw = () => {
      const items = lines();
      if (!items.length) {
        host.innerHTML = `<div class="empty"><p class="serif">Your bag is empty.</p><a class="btn" href="#/shop">Explore the collection</a></div>`;
        return;
      }
      host.innerHTML = `
      <form class="co-form" id="co-form" novalidate>
        <p class="demo-banner" role="note"><b>Demonstration only.</b> No payment is processed and card details are never stored or sent anywhere.</p>
        <fieldset><legend>Contact</legend>${field('email', 'Email', 'type="email" autocomplete="email" required')}</fieldset>
        <fieldset><legend>Shipping address</legend>
          <div class="row2">${field('first', 'First name', 'autocomplete="given-name" required')}${field('last', 'Last name', 'autocomplete="family-name" required')}</div>
          ${field('address', 'Address', 'autocomplete="street-address" required')}
          <div class="row3">${field('city', 'City', 'autocomplete="address-level2" required')}${field('postal', 'Postal code', 'autocomplete="postal-code" required')}${field('country', 'Country', 'autocomplete="country-name" required')}</div>
        </fieldset>
        <fieldset><legend>Payment</legend>
          ${field('card', 'Card number', 'inputmode="numeric" placeholder="4242 4242 4242 4242" autocomplete="off" required')}
          <div class="row2">${field('exp', 'Expiry (MM/YY)', 'inputmode="numeric" placeholder="09/29" autocomplete="off" required')}${field('cvc', 'CVC', 'inputmode="numeric" placeholder="123" autocomplete="off" required')}</div>
        </fieldset>
        <button class="btn block" type="submit" id="pay-btn"><span>Place demo order — ${money(summary(items).total)}</span></button>
      </form>
      <aside class="co-summary">${summaryHtml(items)}</aside>`;
      $('#co-form', host).addEventListener('submit', submit);
      $('#card', host).addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim(); });
    };

    const rules = {
      email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email address.',
      first: v => !!v || 'Required.', last: v => !!v || 'Required.', address: v => !!v || 'Required.', city: v => !!v || 'Required.', postal: v => !!v || 'Required.', country: v => !!v || 'Required.',
      card: v => /^\d{12,19}$/.test(v.replace(/\s/g, '')) || 'Enter the card number.',
      exp: v => /^(0[1-9]|1[0-2])\/?\d{2}$/.test(v.trim()) || 'Use MM/YY.',
      cvc: v => /^\d{3,4}$/.test(v.trim()) || 'Enter 3 or 4 digits.'
    };

    function submit(e) {
      e.preventDefault();
      const form = e.target;
      let firstBad = null;
      Object.entries(rules).forEach(([id, rule]) => {
        const input = $('#' + id, form);
        const result = rule(input.value.trim());
        const ok = result === true;
        $('#' + id + '-err', form).textContent = ok ? '' : result;
        input.setAttribute('aria-invalid', String(!ok));
        if (!ok && !firstBad) firstBad = input;
      });
      if (firstBad) { firstBad.focus(); toast('Please check the highlighted fields'); return; }
      const btn = $('#pay-btn', form);
      btn.classList.add('loading'); btn.disabled = true;
      $('span', btn).textContent = 'Processing demo order…';
      const items = lines();
      setTimeout(() => {
        const order = 'NV-' + Math.floor(100000 + Math.random() * 900000);
        const email = $('#email', form).value.trim();
        cart.clear();
        host.innerHTML = `<div class="confirm"><div class="check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12.500 4.500 4.500L19 7.500"/></svg></div>
          <p class="eyebrow">Order confirmed (demo)</p><h2>Thank you.</h2><p class="muted">Order <b>${order}</b>. A confirmation would be sent to ${esc(email)}. This was a demonstration: nothing was charged and no order exists.</p>
          <div class="co-summary flat">${summaryHtml(items)}</div><a class="btn" href="#/shop">Continue shopping</a></div>`;
        if (!reducedMotion()) gsap.fromTo('.confirm > *', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: DUR.base, stagger: 0.08, ease: EASE.out, clearProps: 'transform,opacity' });
        window.scrollTo(0, 0);
      }, 1500);
    }
    draw();
  }
  return { html, mount };
}
