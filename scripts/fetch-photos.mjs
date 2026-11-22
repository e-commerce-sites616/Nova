// Downloads photos listed in photos.urls.json into src/assets/products/<id>/ (run: npm run photos).
// Format: { "aura-one": ["https://.../a.jpg", "https://.../b.jpg"], "form-75": [...] }
// Optional per-finish sets: { "form-75": { "default": [...], "silver": [...] } }
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const manifestPath = 'photos.urls.json';
if (!existsSync(manifestPath)) { console.error(`Create ${manifestPath} first (see photos.urls.example.json).`); process.exit(1); }
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const extFor = type => ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' }[type?.split(';')[0]] || 'jpg');

for (const [id, entry] of Object.entries(manifest)) {
  const sets = Array.isArray(entry) ? { default: entry } : entry;
  for (const [finish, urls] of Object.entries(sets)) {
    for (const [i, url] of urls.entries()) {
      if (url.includes('REPLACE_ME')) { console.log(`skip  ${id} (placeholder URL)`); continue; }
      try {
        const res = await fetch(url, { redirect: 'follow' });
        if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
        const dir = path.join('src', 'assets', 'products', id);
        await mkdir(dir, { recursive: true });
        const name = `${finish === 'default' ? '' : finish + '-'}${i + 1}.${extFor(res.headers.get('content-type'))}`;
        await writeFile(path.join(dir, name), Buffer.from(await res.arrayBuffer()));
        console.log(`saved ${id}/${name}`);
      } catch (err) { console.error(`FAILED ${id} ${url}: ${err.message}`); }
    }
  }
}
