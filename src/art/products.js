// Original inline SVG product renders. Every product is drawn from a tone palette,
// so finish variants and gallery angles are real, local and instantly switchable.
let counter = 0;

export const TONES = {
  graphite: { name: 'Graphite', body: '#32363c', hi: '#666c75', lo: '#14161a', accent: '#c4c6c8' },
  silver:   { name: 'Silver',   body: '#b3b6ba', hi: '#f0f1f1', lo: '#6f7378', accent: '#17191c' },
  bone:     { name: 'Bone',     body: '#d9d5cb', hi: '#f7f5ef', lo: '#948f84', accent: '#35393e' },
  midnight: { name: 'Midnight', body: '#1c2533', hi: '#46566f', lo: '#0a0e15', accent: '#a9bdd8' },
  // colourways that exist in the product photography
  moss:   { name: 'Moss',   body: '#3d4a35', hi: '#6e8060', lo: '#1a2118', accent: '#c9d3bd' },
  denim:  { name: 'Denim',  body: '#3d6794', hi: '#7ea3cb', lo: '#1b3350', accent: '#dbe8f5' },
  sage:   { name: 'Sage',   body: '#9fb8a0', hi: '#d3e4d2', lo: '#5f7a62', accent: '#2c3d2f' },
  sky:    { name: 'Sky',    body: '#a7c3dc', hi: '#e1eef8', lo: '#6b8fae', accent: '#243849' },
  blush:  { name: 'Blush',  body: '#e5b9c3', hi: '#f9e4e8', lo: '#a97985', accent: '#4a2a33' },
  mint:   { name: 'Mint',   body: '#a6dcc9', hi: '#dff5ec', lo: '#5f9c88', accent: '#e8624a' },
  lilac:  { name: 'Lilac',  body: '#b3a2dc', hi: '#e3dbf5', lo: '#7261a3', accent: '#2f2552' },
  peach:  { name: 'Peach',  body: '#f0b59c', hi: '#fbdccf', lo: '#b97a63', accent: '#f6e7c4' },
  coral:  { name: 'Coral',  body: '#ee6f43', hi: '#ffa07f', lo: '#a63f1c', accent: '#fff1ea' },
  cobalt: { name: 'Cobalt', body: '#2f66c7', hi: '#74a0ee', lo: '#173a7c', accent: '#e7f0ff' },
  ice:    { name: 'Ice',    body: '#cfe1ee', hi: '#f3f9fd', lo: '#8aa7bc', accent: '#1d3a52' },
  dusk:   { name: 'Dusk',   body: '#6a5b9e', hi: '#a99ad6', lo: '#322a57', accent: '#e9e4ff' },
  brass:  { name: 'Brass',  body: '#b99b4c', hi: '#ecd58f', lo: '#6c5a22', accent: '#2a2412' }
};

const gradients = (t, i) => `
  <linearGradient id="${i}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.hi}"/><stop offset=".55" stop-color="${t.body}"/><stop offset="1" stop-color="${t.lo}"/></linearGradient>
  <linearGradient id="${i}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.hi}"/><stop offset="1" stop-color="${t.body}"/></linearGradient>
  <radialGradient id="${i}s"><stop offset="0" stop-color="#000" stop-opacity=".6"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  <radialGradient id="${i}g"><stop offset="0" stop-color="${t.accent}" stop-opacity=".5"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></radialGradient>`;

const DRAW = {
  headphones: (t, i) => ({
    detail: '30 170 170 190',
    body: `
      <path d="M88 240C84 70 316 70 312 240" fill="none" stroke="${t.lo}" stroke-width="22" stroke-linecap="round"/>
      <path d="M88 240C84 70 316 70 312 240" fill="none" stroke="url(#${i}a)" stroke-width="13" stroke-linecap="round"/>
      <path d="M142 112C182 96 218 96 258 112" fill="none" stroke="${t.lo}" stroke-width="11" stroke-linecap="round" opacity=".8"/>
      <path d="M92 208v-16M308 208v-16" stroke="${t.lo}" stroke-width="9" stroke-linecap="round"/>
      <rect x="54" y="206" width="78" height="134" rx="39" fill="url(#${i}a)"/>
      <rect x="42" y="224" width="26" height="100" rx="13" fill="${t.lo}"/>
      <circle cx="93" cy="273" r="23" fill="none" stroke="${t.accent}" stroke-width="2" opacity=".7"/>
      <circle cx="93" cy="273" r="4" fill="${t.accent}"/>
      <rect x="268" y="206" width="78" height="134" rx="39" fill="url(#${i}a)"/>
      <rect x="332" y="224" width="26" height="100" rx="13" fill="${t.lo}"/>
      <circle cx="307" cy="273" r="23" fill="none" stroke="${t.accent}" stroke-width="2" opacity=".7"/>
      <circle cx="307" cy="273" r="4" fill="${t.accent}"/>`
  }),
  earbuds: (t, i) => {
    const bud = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-8" y="14" width="16" height="70" rx="8" fill="url(#${i}a)"/><ellipse rx="29" ry="33" fill="url(#${i}a)"/><circle cy="-6" r="11" fill="${t.lo}"/><circle cy="-6" r="3.5" fill="${t.accent}" opacity=".8"/></g>`;
    return {
      detail: '100 50 200 190',
      body: `${bud(150, 104, 14)}${bud(250, 104, -14)}
        <rect x="104" y="196" width="192" height="136" rx="52" fill="url(#${i}a)"/>
        <path d="M104 250H296" stroke="${t.lo}" stroke-width="3" opacity=".8"/>
        <rect x="190" y="236" width="20" height="28" rx="10" fill="${t.lo}" opacity=".35"/>
        <circle cx="200" cy="292" r="4" fill="${t.accent}"/>`
    };
  },
  keyboard: (t, i) => {
    let k = '';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 14; c++) {
      const accent = (r === 0 && c === 0) || (r === 2 && c === 13);
      k += `<rect x="${46 + c * 22.8}" y="${136 + r * 23.5}" width="20.6" height="20.6" rx="4.5" fill="${accent ? t.accent : `url(#${i}v)`}" ${accent ? 'opacity=".9"' : ''}/>`;
    }
    k += `<rect x="46" y="${136 + 4 * 23.5}" width="${22.8 * 3 - 2.2}" height="20.6" rx="4.5" fill="url(#${i}v)"/>`;
    k += `<rect x="${46 + 3 * 22.8}" y="${136 + 4 * 23.5}" width="${22.8 * 6 - 2.2}" height="20.6" rx="4.5" fill="url(#${i}v)"/>`;
    k += `<rect x="${46 + 9 * 22.8}" y="${136 + 4 * 23.5}" width="${22.8 * 5 - 2.2}" height="20.6" rx="4.5" fill="url(#${i}v)"/>`;
    return {
      detail: '24 130 190 140',
      body: `<g transform="matrix(1 0 -.16 .88 38 62)">
        <rect x="28" y="118" width="344" height="176" rx="22" fill="url(#${i}a)"/>
        <rect x="36" y="126" width="328" height="160" rx="16" fill="${t.lo}" opacity=".6"/>${k}</g>`
    };
  },
  mouse: (t, i) => ({
    detail: '120 50 160 160',
    body: `<path d="M200 66C272 66 304 138 300 232C296 322 262 352 200 352C138 352 104 322 100 232C96 138 128 66 200 66Z" fill="url(#${i}a)"/>
      <path d="M200 70V196" stroke="${t.lo}" stroke-width="3" opacity=".7"/>
      <path d="M104 198Q200 214 296 198" fill="none" stroke="${t.lo}" stroke-width="3" opacity=".7"/>
      <rect x="191" y="100" width="18" height="44" rx="9" fill="${t.lo}"/>
      <rect x="195" y="108" width="10" height="16" rx="5" fill="${t.accent}"/>
      <path d="M112 250C116 300 140 330 170 340" fill="none" stroke="${t.accent}" stroke-width="3" stroke-linecap="round" opacity=".55"/>
      <circle cx="200" cy="300" r="6" fill="${t.accent}" opacity=".8"/>`
  }),
  speaker: (t, i) => {
    let dots = '';
    for (let r = 0; r < 11; r++) for (let c = 0; c < 6; c++) dots += `<circle cx="${148 + c * 20.8}" cy="${142 + r * 16.5}" r="3.2" fill="${t.lo}" opacity=".75"/>`;
    return {
      detail: '120 70 160 160',
      body: `<ellipse cx="200" cy="334" rx="76" ry="10" fill="${t.lo}" opacity=".8"/>
        <rect x="116" y="76" width="168" height="256" rx="64" fill="url(#${i}a)"/>
        <rect x="136" y="92" width="128" height="14" rx="7" fill="${t.lo}" opacity=".7"/>
        <rect x="152" y="95" width="30" height="8" rx="4" fill="${t.accent}" opacity=".9"/>${dots}
        <circle cx="200" cy="316" r="5" fill="${t.accent}" opacity=".85"/>`
    };
  },
  controller: (t, i) => ({
    detail: '150 120 220 180',
    body: `<path d="M118 130C160 116 240 116 282 130C334 142 358 204 362 262C365 304 340 332 314 322C290 312 280 292 262 276L138 276C120 292 110 312 86 322C60 332 35 304 38 262C42 204 66 142 118 130Z" fill="url(#${i}a)"/>
      <circle cx="126" cy="196" r="25" fill="${t.lo}"/><circle cx="126" cy="196" r="15" fill="url(#${i}v)"/>
      <circle cx="238" cy="244" r="25" fill="${t.lo}"/><circle cx="238" cy="244" r="15" fill="url(#${i}v)"/>
      <path d="M158 236h32M174 220v32" stroke="${t.lo}" stroke-width="12" stroke-linecap="round"/>
      <circle cx="296" cy="172" r="9" fill="${t.lo}"/><circle cx="322" cy="196" r="9" fill="${t.lo}"/><circle cx="270" cy="196" r="9" fill="${t.lo}"/><circle cx="296" cy="220" r="9" fill="${t.accent}" opacity=".9"/>
      <rect x="176" y="152" width="48" height="10" rx="5" fill="${t.lo}" opacity=".7"/>`
  }),
  lamp: (t, i) => ({
    detail: '150 60 220 190',
    body: `<circle cx="256" cy="150" r="96" fill="url(#${i}g)"/>
      <rect x="130" y="326" width="140" height="18" rx="9" fill="url(#${i}a)"/>
      <path d="M200 326L168 214L246 128" fill="none" stroke="${t.lo}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M200 326L168 214L246 128" fill="none" stroke="url(#${i}a)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="168" cy="214" r="10" fill="${t.accent}"/>
      <g transform="rotate(-38 258 142)"><rect x="214" y="112" width="92" height="40" rx="20" fill="url(#${i}a)"/><rect x="224" y="140" width="72" height="8" rx="4" fill="${t.accent}" opacity=".9"/></g>`
  })
};

export function art(type, tone = 'graphite', angle = 'front', label = '') {
  const t = TONES[tone] || TONES.graphite;
  const id = `n${++counter}_`;
  const spec = DRAW[type](t, id);
  const view = angle === 'detail' ? spec.detail : '0 0 400 400';
  const transform = angle === 'tilt' ? 'transform="translate(400 0) scale(-1 1) rotate(-7 200 220)"' : '';
  const shadow = angle === 'detail' ? '' : `<ellipse cx="200" cy="372" rx="132" ry="13" fill="url(#${id}s)"/>`;
  const a11y = label ? `role="img" aria-label="${label.replace(/"/g, '&quot;')}"` : 'aria-hidden="true"';
  return `<svg class="art" viewBox="${view}" ${a11y} xmlns="http://www.w3.org/2000/svg"><defs>${gradients(t, id)}</defs>${shadow}<g ${transform}>${spec.body}</g></svg>`;
}
