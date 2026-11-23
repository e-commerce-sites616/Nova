// Pre-deploy sanity check (npm run check). Fails the build on real problems, warns on suspicious ones:
//   - every source file parses
//   - every finish in the catalogue has a swatch tone and a main photo
//   - every referenced /video/*.mp4|jpg exists in public/video
//   - nothing in the repo is big enough for GitHub to reject (100 MB) or Render to choke on
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [], warnings = [];
const walk = (dir, skip = []) => readdirSync(dir, { withFileTypes: true }).flatMap(e => {
  const p = path.join(dir, e.name);
  return skip.includes(e.name) ? [] : e.isDirectory() ? walk(p, skip) : [p];
});

// 1. syntax
for (const f of [...walk(path.join(root, 'src')), ...walk(path.join(root, 'scripts'))].filter(f => /\.(m?js)$/.test(f))) {
  const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
  if (r.status !== 0) errors.push(`syntax error in ${path.relative(root, f)}\n${r.stderr}`);
}

// 2. catalogue vs. media
const { PRODUCTS } = await import(pathToFileURL(path.join(root, 'src/data/products.js')).href);
const { TONES } = await import(pathToFileURL(path.join(root, 'src/art/products.js')).href);
for (const p of PRODUCTS) {
  for (const f of p.options.Finish || []) {
    if (!TONES[f]) errors.push(`${p.id}: finish "${f}" has no entry in TONES (src/art/products.js)`);
    for (const n of [1, 2]) {
      if (!existsSync(path.join(root, 'src/assets/products', p.id, `${f}-${n}.webp`))) warnings.push(`${p.id}: no photo ${f}-${n}.webp (the SVG render is used instead)`);
    }
  }
  if (p.film) for (const ext of ['mp4', 'jpg']) if (!existsSync(path.join(root, 'public/video', `${p.film.name}.${ext}`))) errors.push(`${p.id}: film "${p.film.name}.${ext}" is missing from public/video`);
}

// 3. videos referenced in the source
const srcText = walk(path.join(root, 'src')).filter(f => f.endsWith('.js')).map(f => readFileSync(f, 'utf8')).join('\n');
for (const m of new Set(srcText.match(/\/video\/[\w-]+\.(?:mp4|jpg)/g) || [])) {
  if (!existsSync(path.join(root, 'public', m))) errors.push(`${m} is referenced in src/ but missing from public/`);
}

// 4. file sizes
for (const f of walk(root, ['node_modules', 'dist', '.git', 'videos'])) {
  const mb = statSync(f).size / 1048576;
  const rel = path.relative(root, f);
  if (mb > 100) errors.push(`${rel} is ${mb.toFixed(0)} MB - GitHub rejects files over 100 MB`);
  else if (mb > 25 && !rel.startsWith('images')) warnings.push(`${rel} is ${mb.toFixed(0)} MB - consider compressing it`);
}

warnings.forEach(w => console.warn('warn  ' + w));
errors.forEach(e => console.error('ERROR ' + e));
console.log(errors.length ? `\ncheck failed: ${errors.length} error(s)` : `check passed${warnings.length ? ` (${warnings.length} warning(s))` : ''}`);
process.exit(errors.length ? 1 : 0);
