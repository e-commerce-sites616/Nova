import { TONES } from '../art/products.js';

export const CATEGORIES = [
  { id: 'audio', name: 'Audio', art: 'headphones', blurb: 'Headphones, earbuds and speakers tuned by ear.' },
  { id: 'keyboards', name: 'Keyboards', art: 'keyboard', blurb: 'Precision-machined boards with a considered feel.' },
  { id: 'mice', name: 'Mice', art: 'mouse', blurb: 'Featherlight, sculpted and effortlessly accurate.' },
  { id: 'controllers', name: 'Controllers', art: 'controller', blurb: 'Hand-fitted control for long, focused sessions.' },
  { id: 'smart-desk', name: 'Smart & Desk', art: 'lamp', blurb: 'Quiet, intelligent objects for the desk.' }
];

const P = o => ({ status: 'in-stock', stock: 24, featured: false, bestseller: false, isNew: false, flagship: false, ...o });

export const PRODUCTS = [
  P({
    id: 'aura-one', name: 'Aura One', brand: 'NOVA Audio', category: 'audio', art: 'headphones', price: 349,
    tagline: 'Wireless over-ear headphones', flagship: true, featured: true, bestseller: true, stock: 18,
    options: { Finish: ['graphite', 'silver', 'bone', 'denim', 'moss'] },
    film: { name: 'aura-one-film', title: 'Silence, <em>composed.</em>', text: 'See noise cancelling at work: the city on one layer, your music on the other, and the quiet you choose in between.' },
    desc: 'Aura One is our reference over-ear headphone: tuned drivers, adaptive noise control and a light, rigid frame that disappears on the head. Built for listening, not for show.',
    features: [
      { title: 'Acoustics without compromise', text: 'Large dynamic drivers deliver a wide, unhurried soundstage with tight, controlled low end, with EQ that adapts to how loud you listen.' },
      { title: 'Built to disappear', text: 'A metal-reinforced frame and plush memory-foam cushions wrapped in soft protein leather. At 236 grams, light enough to forget you are wearing them.' },
      { title: 'Quiet when you ask for it', text: 'Quiet mode shuts the world out, Aware mode lets it back in, and up to 24 hours of battery keeps it all going.' }
    ],
    specs: [['Driver', 'Dynamic, factory-tuned'], ['Battery', 'Up to 24 hours'], ['Connectivity', 'Bluetooth 5.1, USB-C, 3.5 mm wired'], ['Weight', '236 g'], ['Noise control', 'Quiet, Aware and custom modes'], ['Warranty', '2 years']]
  }),
  P({
    id: 'aura-buds', name: 'Aura Buds', brand: 'NOVA Audio', category: 'audio', art: 'earbuds', price: 179, isNew: true, stock: 40,
    tagline: 'True wireless earbuds',
    options: { Finish: ['graphite', 'bone', 'moss', 'sky', 'blush'] },
    film: { name: 'aura-buds-film', title: 'Small things, <em>in motion.</em>', text: 'Compact, colourful and tuned for all-day wear: a closer look at the details that make Aura Buds.' },
    desc: 'Compact true wireless earbuds with adaptive noise cancelling and a pocketable case with a light bar that shows charge at a glance.',
    features: [
      { title: 'Small, precise, balanced', text: '10 mm dynamic drivers with a tuned acoustic chamber keep vocals clear at every volume.' },
      { title: 'A case worth carrying', text: 'A soft-touch case with a light bar that shows charge at a glance, and up to 45 hours of total playback.' },
      { title: 'Fit that stays put', text: 'Three silicone tip sizes and a low-profile stem designed around the ear.' }
    ],
    specs: [['Driver', '10 mm dynamic'], ['Noise control', 'Adaptive, up to 42 dB'], ['Battery', 'Up to 10 h, 45 h with case'], ['Connectivity', 'Bluetooth 5.4'], ['Water resistance', 'IPX4'], ['Warranty', '2 years']]
  }),
  P({
    id: 'sonic-sculpt', name: 'Sonic Sculpt', brand: 'NOVA Audio', category: 'audio', art: 'speaker', price: 229, featured: true, bestseller: true, stock: 31,
    tagline: 'Portable room-filling speaker',
    options: { Finish: ['cobalt', 'moss'] },
    desc: 'A woven-mesh cylinder that fills a room with detailed, balanced sound, wrapped in a halo of light. Splash-proof, strapped for travel and refined where it counts.',
    features: [
      { title: '360° sound', text: 'Dual drivers and a passive radiator project an even, room-filling image from any shelf.' },
      { title: 'A halo of light', text: 'A light ring around the top moves in time with the music. Dim it, or turn it off entirely.' },
      { title: 'Goes where you do', text: 'Up to 15 hours of playback, IPX5 splash protection and a braided loop that clips to a bag.' }
    ],
    specs: [['Output', '15 W (20 W peak)'], ['Battery', 'Up to 15 hours'], ['Protection', 'IPX5'], ['Connectivity', 'Bluetooth 5.3, USB-C, stereo pairing'], ['Weight', '312 g'], ['Warranty', '2 years']]
  }),
  P({
    id: 'sonic-mini', name: 'Sonic Mini', brand: 'NOVA Audio', category: 'audio', art: 'speaker', price: 129, status: 'preorder', stock: 0,
    tagline: 'Compact desk speaker',
    options: { Finish: ['blush'] },
    desc: 'A compact speaker with the voice of something much larger. Ships in January.',
    features: [
      { title: 'Small footprint', text: 'Designed for desks and shelves, with a low-distortion driver tuned for near-field listening.' },
      { title: 'One-touch pairing', text: 'Multipoint Bluetooth with two devices connected at once.' },
      { title: 'All-day battery', text: '16 hours of playback from a single charge.' }
    ],
    specs: [['Driver', '1 × 50 mm full-range'], ['Battery', 'Up to 16 hours'], ['Connectivity', 'Bluetooth 5.3'], ['Weight', '420 g'], ['Ships', 'January 2027'], ['Warranty', '2 years']]
  }),
  P({
    id: 'form-75', name: 'Form 75', brand: 'NOVA Input', category: 'keyboards', art: 'keyboard', price: 219, featured: true, bestseller: true, stock: 22,
    tagline: '75% mechanical keyboard',
    options: { Finish: ['graphite', 'silver', 'ice', 'dusk'], Switch: ['Linear', 'Tactile'] },
    desc: 'A 75% mechanical keyboard in a CNC-milled aluminium case. Gasket-mounted, factory-lubed and acoustically damped for a deep, composed sound.',
    features: [
      { title: 'A sound you will notice', text: 'Gasket mounting, a PE foam layer and a silicone damper give every keystroke a soft, resolved thock.' },
      { title: 'Milled from one block', text: 'A 6063 aluminium case, bead-blasted and anodised, weighing a deliberate 1.4 kg.' },
      { title: 'Yours to tune', text: 'Hot-swap sockets, per-key remapping and tri-mode wireless with 4,000 mAh of battery.' }
    ],
    specs: [['Layout', '75%, 82 keys'], ['Case', 'CNC aluminium'], ['Mounting', 'Gasket'], ['Connectivity', 'USB-C, Bluetooth, 2.4 GHz'], ['Battery', '4,000 mAh'], ['Weight', '1.4 kg']]
  }),
  P({
    id: 'form-tkl', name: 'Form TKL', brand: 'NOVA Input', category: 'keyboards', art: 'keyboard', price: 259, isNew: true, status: 'low', stock: 4,
    tagline: 'Tenkeyless mechanical keyboard',
    options: { Finish: ['graphite'], Switch: ['Linear', 'Tactile'] },
    desc: 'The full-size experience, trimmed. A tenkeyless layout with a brass weight and a soft violet underglow.',
    features: [
      { title: 'Brass-weighted', text: 'A hidden brass plate lowers the pitch and anchors the board to the desk.' },
      { title: 'Light at the edges', text: 'A soft violet underglow traces the case. Per-key lighting can be dimmed or switched off entirely.' },
      { title: 'Built for the long term', text: 'PBT double-shot keycaps and switches rated to 100 million presses.' }
    ],
    specs: [['Layout', 'TKL, 87 keys'], ['Case', 'Aluminium + brass weight'], ['Keycaps', 'Double-shot PBT'], ['Connectivity', 'USB-C, Bluetooth, 2.4 GHz'], ['Switch life', '100 million presses'], ['Weight', '1.9 kg']]
  }),
  P({
    id: 'arc-mouse', name: 'Arc', brand: 'NOVA Play', category: 'mice', art: 'mouse', price: 129, bestseller: true, stock: 52,
    tagline: 'Wireless ergonomic mouse',
    options: { Finish: ['graphite', 'bone'] },
    desc: 'A sculpted wireless mouse that fits the hand and gets out of the way. Light, precise and quiet.',
    features: [
      { title: 'Sculpted for the hand', text: 'A shape refined across 40 prototypes to suit both palm and claw grips.' },
      { title: 'Sensor you can trust', text: 'A 26,000 DPI optical sensor with sub-millimetre tracking on any surface.' },
      { title: 'Weighs almost nothing', text: '59 grams and up to 90 hours of battery.' }
    ],
    specs: [['Sensor', '26,000 DPI optical'], ['Weight', '59 g'], ['Battery', 'Up to 90 hours'], ['Connectivity', '2.4 GHz, Bluetooth'], ['Buttons', '6 programmable'], ['Warranty', '2 years']]
  }),
  P({
    id: 'arc-air', name: 'Arc Air', brand: 'NOVA Play', category: 'mice', art: 'mouse', price: 149, isNew: true, stock: 27,
    tagline: 'Ultralight performance mouse',
    options: { Finish: ['bone', 'graphite'] },
    desc: 'An ultralight take on Arc, with a featherweight shell and the same precise shape at just 63 grams.',
    features: [
      { title: '63 grams', text: 'A skeletal internal frame removes weight without losing rigidity.' },
      { title: 'Instant response', text: '8,000 Hz polling over 2.4 GHz for the lowest possible latency.' },
      { title: 'Glide, refined', text: 'Pure PTFE feet that wear in rather than wear out.' }
    ],
    specs: [['Sensor', '30,000 DPI optical'], ['Weight', '63 g'], ['Polling rate', 'Up to 8,000 Hz'], ['Battery', 'Up to 90 hours'], ['Connectivity', '2.4 GHz, USB-C'], ['Warranty', '2 years']]
  }),
  P({
    id: 'pulse-controller', name: 'Pulse', brand: 'NOVA Play', category: 'controllers', art: 'controller', price: 99, bestseller: true, stock: 60,
    tagline: 'Wireless game controller',
    options: { Finish: ['graphite', 'sage', 'mint', 'lilac', 'peach'] },
    desc: 'A wireless controller with a satisfying weight, precise sticks and a thoughtful, simple layout.',
    features: [
      { title: 'Considered weight', text: 'A balanced shell tuned for hours of play without fatigue.' },
      { title: 'Hall-effect sticks', text: 'Magnetic sensors that stay accurate and resist drift.' },
      { title: 'Plays anywhere', text: 'A tiny 2.4 GHz dongle in the box for low-latency PC play, plus Bluetooth and USB-C for everything else.' }
    ],
    specs: [['Sticks', 'Hall-effect'], ['Battery', 'Up to 30 hours'], ['Connectivity', 'Bluetooth, 2.4 GHz dongle, USB-C'], ['Compatibility', 'PC, mobile, console'], ['Weight', '235 g'], ['Warranty', '2 years']]
  }),
  P({
    id: 'pulse-elite', name: 'Pulse Elite', brand: 'NOVA Play', category: 'controllers', art: 'controller', price: 169, featured: true, stock: 14,
    tagline: 'Pro modular controller',
    options: { Finish: ['graphite', 'bone'] },
    desc: 'The enthusiast controller: swappable thumbsticks, adjustable triggers and rear paddles, all in a metal-weighted shell.',
    features: [
      { title: 'Swap in seconds', text: 'Magnetic thumbsticks and a four-piece d-pad kit in the box.' },
      { title: 'Triggers that adapt', text: 'Three hair-trigger lock positions for fast or full-range travel.' },
      { title: 'Rear paddles', text: 'Four remappable paddles, programmable from the NOVA app.' }
    ],
    specs: [['Sticks', 'Swappable, Hall-effect'], ['Triggers', '3-stage lock'], ['Paddles', '4, remappable'], ['Battery', 'Up to 40 hours'], ['Weight', '290 g'], ['Warranty', '2 years']]
  }),
  P({
    id: 'halo-lamp', name: 'Halo', brand: 'NOVA Living', category: 'smart-desk', art: 'lamp', price: 139, isNew: true, bestseller: true, stock: 33,
    tagline: 'Clamp-on desk light bar',
    options: { Finish: ['graphite', 'silver', 'brass'] },
    desc: 'A wide, flicker-free light bar on a flexible arm that clamps to the edge of your desk. Touch to dim, tap to shift colour temperature.',
    features: [
      { title: 'Light that follows the day', text: 'Cool and focused in the morning, warm and calm at night, adjusted automatically.' },
      { title: 'Flexible arm', text: 'A gooseneck that holds any position without drifting, and leaves the desk surface completely free.' },
      { title: 'Even, wide light', text: 'A 17-inch bar spreads soft, glare-free light across the whole desk, with no hard shadows.' }
    ],
    specs: [['Light', '2700–6500 K, stepless dimming'], ['Light bar', '17 in (43 cm)'], ['Control', 'Touch dimmer'], ['Arm', 'Flexible gooseneck'], ['Mount', 'Desk clamp'], ['Warranty', '2 years']]
  }),
  P({
    id: 'lumen-mini', name: 'Lumen', brand: 'NOVA Living', category: 'smart-desk', art: 'lamp', price: 89, stock: 45,
    tagline: 'Colour-accent task light',
    options: { Finish: ['coral', 'sky', 'blush'] },
    desc: 'The same wide, glare-free light bar as Halo, finished in a single saturated colour. Made for desks with a personality.',
    features: [
      { title: 'Clamps on, stays out of the way', text: 'A slim clamp leaves room for what matters.' },
      { title: 'Even, soft light', text: 'A wide diffuser removes glare and hard shadows.' },
      { title: 'Rechargeable', text: 'Up to 12 hours of light on a single USB-C charge.' }
    ],
    specs: [['Light', '2700–5000 K, CRI 90+'], ['Output', 'Up to 400 lumens'], ['Battery', 'Up to 12 hours'], ['Control', 'Touch dial'], ['Power', 'USB-C'], ['Warranty', '1 year']]
  })
];

export const byId = id => PRODUCTS.find(p => p.id === id);
export const categoryName = id => (CATEGORIES.find(c => c.id === id) || {}).name || '';
export const defaultOpts = p => Object.fromEntries(Object.entries(p.options).map(([k, v]) => [k, v[0]]));
export const optLabel = (group, value) => (group === 'Finish' ? (TONES[value] || {}).name || value : value);
export const optsSummary = opts => Object.entries(opts).map(([k, v]) => optLabel(k, v)).join(' · ');
export const statusLabel = p => (p.status === 'preorder' ? 'Pre-order · ships January' : p.status === 'low' ? `Low stock · only ${p.stock} left` : 'In stock · ships in 1–2 days');
