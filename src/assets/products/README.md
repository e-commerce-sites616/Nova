# Product photography

These files are **generated** from the raw shots in `/images` by `scripts/prepare-photos.py`
(`npm run photos:prepare`). Do not edit them by hand - edit the manifest (`JOBS`) in the script and re-run.

    src/assets/products/<product-id>/<finish>-<n>.webp
      <finish>-1   main studio shot (cards, hero, gallery first frame)
      <finish>-2   shown on card hover
      <finish>-3   detail / close-up (gallery + product story blocks)

`src/media.js` picks them up automatically with Vite's glob. Finish names must exist in `TONES`
(`src/art/products.js`) so the swatch matches the photo.

## The stage colour
Studio shots are multiplied onto the NOVA porcelain colour **in the pixels** (`STAGE` in the script = `--stage`
in `src/style.css`). Change one, change the other, and re-run the script. Lamps (`DARK_SURFACE` in
`src/data/photos.js`) are dark lifestyle scenes and keep a dark surface instead.

## Heads-up: third-party branding
The supplied photos are retail product shots and show other companies' marks (headphone cup wordmark, mouse
logo, earbud glyph, speaker/keyboard text). They are fine as stand-ins for a demonstration store; replace them with
NOVA's own photography (or cleaned-up renders) before any public launch.
