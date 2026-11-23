# NOVA — Technology, Reimagined.

NOVA is a MKSTUDIOS brand.

A premium technology storefront: dark luxury, cinematic motion, studio photography and scroll-driven film.
Front-end only (Vite + vanilla JS + GSAP). No backend; checkout is a demonstration and no payment is processed.

## Quick start
```bash
npm install
npm run dev          # http://localhost:5173
```
Production build: `npm run build && npm run preview`.

## Scripts
| Command | What it does |
|---|---|
| `npm run dev` / `build` / `preview` | Vite dev server, production build to `dist/`, preview the build |
| `npm run check` | Pre-deploy sanity check: syntax, every finish has a tone + photo, every referenced video exists, no file too large for GitHub |
| `npm run photos:prepare` | Rebuild the studio photography from the raw shots in `images/` (needs Python 3 + pillow, numpy, scipy) |
| `npm run videos:prepare` | Rebuild the web videos from raw recordings in `videos/` (needs Python 3 + opencv-python, numpy and ffmpeg) |

The processed media is already committed, so you only need the two `:prepare` scripts when you change the source material.

## Project layout
```
index.html               critical CSS, meta + social tags (filled by vite.config.js)
vite.config.js           injects SITE_URL into the share-image tags
render.yaml              Render blueprint (build, publish dir, cache headers)
public/                  copied as-is: video/ (processed clips + posters), og.jpg, favicon, robots.txt
scripts/                 check.mjs, prepare-photos.py, prepare-videos.py, run-python.mjs
src/
  main.js                hash router (#/, #/shop, #/product/:id, #/wishlist, #/checkout), transitions, global actions
  media.js               turns a product + finish into an <img> (photo) or the SVG fallback
  data/products.js       catalogue: 12 products, finishes, specs, optional film
  data/photos.js         manual photo overrides + which products use the dark surface
  art/products.js        finish tones (swatches) and the SVG renders used as a fallback
  assets/products/       generated studio photography  <product>/<finish>-<n>.webp
  components/            card, chrome (header/footer/bag/search), film player, scroll-scene engine
  views/                 home, shop, product, wishlist, checkout
  motion/index.js        easing/duration tokens, data-reveal / data-lines / data-parallax
  store/                 cart + wishlist (localStorage)
  style.css              the whole design system (see the order note at the top of the file)
```

## How the media works
- **Photography.** Raw retail shots in `images/` are re-framed to a common scale and multiplied onto the porcelain stage colour *in the pixels*
  (`STAGE` in `scripts/prepare-photos.py` must equal `--stage` in `src/style.css`). Lamps are dark lifestyle scenes and keep a dark surface
  (`DARK_SURFACE` in `src/data/photos.js`). Finish names must exist in `TONES` (`src/art/products.js`) so swatches match the photos.
- **Video.** `scripts/prepare-videos.py` removes the screen recorder's mouse cursor, trims outros, crops captions and encodes H.264 with a poster.
  - Home: a scroll-scrubbed case film (`#reveal`), a finish chooser that holds on each colour (`#colours`), and a looping film behind the closing statement.
    Scenes are tall sections with a `position: sticky` stage (`src/components/scene.js`), at every screen size; `prefers-reduced-motion` gets a static version.
    Videos download only when you scroll near them.
  - Product pages: add `film: { name, title, text }` to a product to get a player (poster first, sound on press).
  - Hosting must support HTTP range requests (Vite and Render do) or scrubbing cannot seek.
- **Deep link.** `#/product/aura-buds?finish=moss` opens a product with that finish preselected.

## Deploying (Render static site)
1. Push the repo to GitHub (raw `videos/`, `*.zip` and `images/*.mp4` are git-ignored).
2. Render → **New +** → **Blueprint** → pick the repo → **Apply**. (`render.yaml` sets everything.)
   Manual alternative: **New + → Static Site**, build command `npm ci && npm run check && npm run build`, publish directory `dist`.
3. Optional: add a custom domain, then set `SITE_URL` (e.g. `https://www.yourdomain.com`) so share cards use it.

Routing is hash-based, so no rewrite rules are needed.

## Heads-up
- The supplied photos and films are retail brand material (other companies' logos are visible). Fine for a demonstration; replace with NOVA's own
  photography and footage, and check the music in the films is licensed, before a public launch.
- Motion only animates transform, opacity and clip-path, and is simplified under `prefers-reduced-motion`.
