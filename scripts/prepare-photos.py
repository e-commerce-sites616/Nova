#!/usr/bin/env python3
"""
NOVA studio photo pipeline
==========================
Turns the raw white-background supplier shots in /images into consistent NOVA studio
assets at  src/assets/products/<product-id>/<finish>-<n>.webp  (picked up by Vite's glob in
src/media.js - no code changes needed when you re-run this).

What it does to every "object" shot
  1. finds the product's bounding box and re-frames it on a square canvas at a consistent scale
     (so a mouse and a keyboard feel like they belong to the same catalogue)
  2. multiplies the whole frame by the NOVA "porcelain" stage colour (STAGE below == --stage in
     style.css), so the white backdrop becomes the stage colour. Doing this in the pixels (rather
     than with a CSS blend mode) means it survives GSAP transforms, opacity cross-fades and any
     container shape - the image and its container are simply the same colour
  3. soft shadows, reflections and the gap inside a headband are preserved / tinted correctly,
     because nothing is cut out - a multiply is exactly what a white backdrop is
  4. optionally adds a soft contact shadow for products that float
Detail shots are full-bleed square crops of a region (no padding) so they read as photographic
zooms rather than cut-outs.
"Scene" shots (the lamp lifestyle photos) are dark already and are just cropped to a square.

Usage:   python3 scripts/prepare-photos.py            (writes assets)
         python3 scripts/prepare-photos.py --sheet    (also writes /tmp/nova-sheets/*.png for review)
Needs:   pillow (with webp), numpy, scipy
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'images'
OUT = ROOT / 'src' / 'assets' / 'products'
STAGE = (229, 226, 218)        # #e5e2da  -> keep in sync with --stage in src/style.css
SIZE = 1200
QUALITY = 86

# ---- short names for the source files (see CLAUDE-HANDOFF / README for what each one shows) ----
F = {
    # headphones - same pose, five colourways, plus two blue alternates
    'hp_black': '61windvlNZL._AC_SX679_.jpg', 'hp_grey': '51NQwrNkWvL._AC_SX679_.jpg',
    'hp_white': '51K77J9rCjL._AC_SX679_.jpg', 'hp_blue': '61V2OO10-wL._AC_SX679_.jpg',
    'hp_green': '51y5xR-XcfL._AC_SX679_.jpg', 'hp_blue_pair': '61YfvrPX5GL._AC_SX679_.jpg',
    # earbuds
    'eb_black': '51HbL1WS+KL._AC_SX679_.jpg', 'eb_white': '41RZ4nHfpiL._AC_SY879_.jpg',
    'eb_blue': '41T7lJdeeWL._AC_SY879_.jpg', 'eb_pink': '41ig6RCzu6L._AC_SY879_.jpg',
    'eb_green': '51013C6va8L._AC_SX679_.jpg',
    # keyboards
    'kb_75_grey': '61MC8BK0w0L._AC_SX679_ (1).jpg', 'kb_75_white': '71DMKGhYLWL._AC_SX679_.jpg',
    'kb_75_ice': '61m5GGx5j5L._AC_SX679_.jpg', 'kb_75_dusk': '61-zq1X62mL._AC_SX679_.jpg',
    'kb_96': '61ERdtQkM3L._AC_SX679_.jpg',
    # mice
    'ms_black': '71ohoFWDWYL._AC_SX679_.jpg', 'ms_white': '61P+sPNpFFL._AC_SX679_.jpg',
    # controllers
    'ct_black_top': '51ktVqLJb4L._SX522_.jpg', 'ct_black_angle': '615+1TlB4kL._SX522_.jpg',
    'ct_black_back': '71vK3OkoxcL._SX522_.jpg', 'ct_black_front': '61t8-7jBzGL._SX522_.jpg',
    'ct_white_front': '51PmeLGEkML._SX522_.jpg', 'ct_white_angle': '61GhwgXM-3S._SX522_.jpg',
    'ct_white_angle2': '61WMs0+3w0S._SX522_.jpg',
    'ct_mint': '514wvI38zaL._SX522_.jpg', 'ct_sage': '51DTcaDKELL._SX522_.jpg',
    'ct_lilac': '51Nc3du0DnL._SX522_.jpg', 'ct_peach': '51TFKr+DgpL._SX522_.jpg',
    # speakers
    'sp_camo': '815leI09qpL._AC_SX679_.jpg', 'sp_pink': '81AUrcoYKtL._AC_SX679_.jpg',
    'sp_blue': '91k65M8NACL._AC_SX679_.jpg',
    # lamps (lifestyle scenes)
    'lp_black': '71Xa0fzUiGL._AC_SX679_.jpg', 'lp_grey': '91QQLYLjO3L._AC_SX679_.jpg',
    'lp_gold': '71CJ9yiulCL._AC_SX679_.jpg', 'lp_orange': '71dgYA9GTpL._AC_SX679_.jpg',
    'lp_blue': '71mQjNVjv2L._AC_SX679_.jpg', 'lp_pink': '813hPL946tL._AC_SX679_.jpg',
}

# crop windows are fractions (x0, y0, x1, y1) of the source image
HEAD_BAND = (0.30, 0.00, 1.00, 0.50)     # headband + hinge (clear of the cup wordmark)
HEAD_PAD = (0.00, 0.52, 0.52, 1.00)      # cushion + yoke
BUDS_TOP = (0.02, 0.00, 0.74, 0.42)
BUDS_CASE = (0.00, 0.50, 0.66, 1.00)
SPK_TOP = (0.05, 0.00, 0.95, 0.42)
SPK_BODY = (0.00, 0.40, 0.85, 1.00)
KB_LEFT = (0.00, 0.00, 0.52, 0.60)
KB_RIGHT = (0.48, 0.00, 1.00, 0.60)
MS_TOP = (0.04, 0.00, 0.96, 0.40)
MS_SIDE = (0.00, 0.16, 0.70, 0.52)      # left edge buttons + shell (clear of the logo)
PAD_ZOOM = (0.00, 0.12, 0.80, 0.90)
LAMP_BAR = (0.06, 0.00, 0.50, 0.44)
LAMP_ARM = (0.46, 0.00, 1.00, 0.40)

# product -> finish -> list of shots.  shot = (source key, crop or None, options)
# options: shadow (contact shadow), fill (how much of the canvas the object fills)
S = dict(shadow=True)
N = dict(shadow=False)
K = dict(shadow=False, thr=250)    # keyboards: keep the whole faded reflection in frame
JOBS = {
    'aura-one': {
        'graphite': [('hp_black', None, S), ('hp_black', HEAD_BAND, N), ('hp_black', HEAD_PAD, N)],
        'silver': [('hp_grey', None, S), ('hp_grey', HEAD_BAND, N), ('hp_grey', HEAD_PAD, N)],
        'bone': [('hp_white', None, S), ('hp_white', HEAD_BAND, N), ('hp_white', HEAD_PAD, N)],
        'denim': [('hp_blue', None, S), ('hp_blue_pair', None, N), ('hp_blue', HEAD_PAD, N)],
        'moss': [('hp_green', None, S), ('hp_green', HEAD_BAND, N), ('hp_green', HEAD_PAD, N)],
    },
    'aura-buds': {
        'graphite': [('eb_black', None, N), ('eb_black', BUDS_TOP, N), ('eb_black', BUDS_CASE, N)],
        'bone': [('eb_white', None, N), ('eb_white', BUDS_TOP, N), ('eb_white', BUDS_CASE, N)],
        'moss': [('eb_green', None, N), ('eb_green', BUDS_TOP, N), ('eb_green', BUDS_CASE, N)],
        'sky': [('eb_blue', None, N), ('eb_blue', BUDS_TOP, N), ('eb_blue', BUDS_CASE, N)],
        'blush': [('eb_pink', None, N), ('eb_pink', BUDS_TOP, N), ('eb_pink', BUDS_CASE, N)],
    },
    'sonic-sculpt': {
        'cobalt': [('sp_blue', None, S), ('sp_blue', SPK_TOP, N), ('sp_blue', SPK_BODY, N)],
        'moss': [('sp_camo', None, S), ('sp_camo', SPK_TOP, N), ('sp_camo', SPK_BODY, N)],
    },
    'sonic-mini': {
        'blush': [('sp_pink', None, S), ('sp_pink', SPK_TOP, N), ('sp_pink', SPK_BODY, N)],
    },
    'form-75': {
        'graphite': [('kb_75_grey', None, K), ('kb_75_grey', KB_RIGHT, N), ('kb_75_grey', KB_LEFT, N)],
        'silver': [('kb_75_white', None, K), ('kb_75_white', KB_RIGHT, N), ('kb_75_white', KB_LEFT, N)],
        'ice': [('kb_75_ice', None, K), ('kb_75_ice', KB_RIGHT, N), ('kb_75_ice', KB_LEFT, N)],
        'dusk': [('kb_75_dusk', None, K), ('kb_75_dusk', KB_RIGHT, N), ('kb_75_dusk', KB_LEFT, N)],
    },
    'form-tkl': {
        'graphite': [('kb_96', None, K), ('kb_96', KB_LEFT, N), ('kb_96', KB_RIGHT, N)],
    },
    'arc-mouse': {
        'graphite': [('ms_black', None, N), ('ms_black', MS_TOP, N), ('ms_black', MS_SIDE, N)],
        'bone': [('ms_white', None, N), ('ms_white', MS_TOP, N), ('ms_white', MS_SIDE, N)],
    },
    'arc-air': {
        'bone': [('ms_white', None, N), ('ms_white', MS_TOP, N), ('ms_white', MS_SIDE, N)],
        'graphite': [('ms_black', None, N), ('ms_black', MS_TOP, N), ('ms_black', MS_SIDE, N)],
    },
    'pulse-controller': {
        'graphite': [('ct_black_front', None, S), ('ct_black_angle', None, S), ('ct_black_front', PAD_ZOOM, N)],
        'sage': [('ct_sage', None, S), ('ct_sage', PAD_ZOOM, N)],
        'mint': [('ct_mint', None, S), ('ct_mint', PAD_ZOOM, N)],
        'lilac': [('ct_lilac', None, S), ('ct_lilac', PAD_ZOOM, N)],
        'peach': [('ct_peach', None, S), ('ct_peach', PAD_ZOOM, N)],
    },
    'pulse-elite': {
        'graphite': [('ct_black_top', None, N), ('ct_black_back', None, N), ('ct_black_top', (0.10, 0.00, 0.90, 0.62), N)],
        'bone': [('ct_white_angle', None, S), ('ct_white_front', None, S), ('ct_white_angle2', None, S)],
    },
    'halo-lamp': {
        'graphite': [('lp_black', 'scene', None), ('lp_black', LAMP_BAR, 'scene'), ('lp_black', LAMP_ARM, 'scene')],
        'silver': [('lp_grey', 'scene', None), ('lp_grey', LAMP_BAR, 'scene'), ('lp_grey', LAMP_ARM, 'scene')],
        'brass': [('lp_gold', 'scene', None), ('lp_gold', LAMP_BAR, 'scene'), ('lp_gold', LAMP_ARM, 'scene')],
    },
    'lumen-mini': {
        'coral': [('lp_orange', 'scene', None), ('lp_orange', LAMP_BAR, 'scene'), ('lp_orange', LAMP_ARM, 'scene')],
        'sky': [('lp_blue', 'scene', None), ('lp_blue', LAMP_BAR, 'scene'), ('lp_blue', LAMP_ARM, 'scene')],
        'blush': [('lp_pink', 'scene', None), ('lp_pink', LAMP_BAR, 'scene'), ('lp_pink', LAMP_ARM, 'scene')],
    },
}

FILL = {'default': 0.80, 'wide': 0.92, 'detail': 0.90}


def crop_frac(img, box):
    w, h = img.size
    x0, y0, x1, y1 = box
    return img.crop((round(x0 * w), round(y0 * h), round(x1 * w), round(y1 * h)))


def square_window(img, box):
    """Square pixel window around a fractional box, clamped inside the image."""
    w, h = img.size
    x0, y0, x1, y1 = box
    px0, py0, px1, py1 = x0 * w, y0 * h, x1 * w, y1 * h
    side = min(max(px1 - px0, py1 - py0), w, h)
    cx, cy = (px0 + px1) / 2, (py0 + py1) / 2
    left = min(max(cx - side / 2, 0), w - side)
    top = min(max(cy - side / 2, 0), h - side)
    return img.crop((round(left), round(top), round(left + side), round(top + side)))


def tint(img):
    """Multiply by the stage colour: white backdrop -> stage, baked shadows/reflections kept."""
    c = np.asarray(img).astype(np.float32) / 255.0
    return c * (np.array(STAGE, dtype=np.float32) / 255.0)


def to_img(arr):
    return Image.fromarray(np.clip(arr * 255.0 + 0.5, 0, 255).astype(np.uint8))


def studio(img, shadow=False, thr=236):
    """Frame a whole object on the NOVA stage."""
    img = img.convert('RGB')
    mn = np.asarray(img).min(axis=2)
    mask = ndi.binary_opening(mn < thr, iterations=1)
    ys, xs = np.where(mask)
    if len(xs) == 0:
        raise ValueError('empty image')
    pad = 3
    x0, x1 = max(0, xs.min() - pad), min(img.width, xs.max() + 1 + pad)
    y0, y1 = max(0, ys.min() - pad), min(img.height, ys.max() + 1 + pad)
    obj = img.crop((x0, y0, x1, y1))
    w, h = obj.size
    aspect = w / h
    fill = FILL['wide'] if aspect > 1.5 else (0.86 if aspect < 0.8 else FILL['default'])
    scale = fill * SIZE / max(w, h)
    nw, nh = max(1, round(w * scale)), max(1, round(h * scale))
    obj = obj.resize((nw, nh), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=2))
    canvas = Image.new('RGB', (SIZE, SIZE), (255, 255, 255))
    ox = (SIZE - nw) // 2
    oy = (SIZE - nh) // 2 - (round(SIZE * 0.015) if shadow else 0)
    canvas.paste(obj, (ox, oy))
    out = tint(canvas)
    if shadow:
        sh = Image.new('L', (SIZE, SIZE), 0)
        d = ImageDraw.Draw(sh)
        cx, by, rw = ox + nw / 2, oy + nh, nw * 0.36
        d.ellipse([cx - rw, by - SIZE * 0.012, cx + rw, by + SIZE * 0.030], fill=255)
        sh = sh.filter(ImageFilter.GaussianBlur(SIZE * 0.016))
        out = out * (1 - (np.asarray(sh).astype(np.float32) / 255.0)[..., None] * 0.30)
    return to_img(out)


def detail(img, box):
    """Full-bleed square zoom of a region."""
    win = square_window(img.convert('RGB'), box).resize((SIZE, SIZE), Image.LANCZOS)
    return to_img(tint(win.filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=2))))


def scene(img, box=None):
    """Dark lifestyle shot: square crop, no restyling."""
    img = img.convert('RGB')
    if box:
        img = square_window(img, box)
    return img.resize((SIZE, SIZE), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.2, percent=40, threshold=2))


def main():
    sheets = '--sheet' in sys.argv
    produced = []
    for pid, finishes in JOBS.items():
        for finish, shots in finishes.items():
            for n, (key, crop, opt) in enumerate(shots, 1):
                src = Image.open(SRC / F[key])
                is_scene = crop == 'scene' or opt == 'scene'
                box = None if crop in (None, 'scene') else crop
                if is_scene:
                    im = scene(src, box)
                else:
                    im = detail(src, box) if box else studio(src, shadow=opt.get('shadow', False), thr=opt.get('thr', 236))
                dest = OUT / pid / f'{finish}-{n}.webp'
                dest.parent.mkdir(parents=True, exist_ok=True)
                im.save(dest, 'WEBP', quality=QUALITY, method=6)
                produced.append((pid, finish, n, dest, im))
    print(f'wrote {len(produced)} images')
    if sheets:
        sd = Path('/tmp/nova-sheets')
        sd.mkdir(exist_ok=True)
        by = {}
        for pid, finish, n, dest, im in produced:
            by.setdefault(pid, []).append((finish, n, im))
        for pid, items in by.items():
            cols = 6
            rows = (len(items) + cols - 1) // cols
            t = 300
            sh = Image.new('RGB', (cols * t, rows * (t + 18)), (20, 20, 22))
            d = ImageDraw.Draw(sh)
            for k, (finish, n, im) in enumerate(items):
                x, y = (k % cols) * t, (k // cols) * (t + 18)
                sh.paste(im.resize((t - 6, t - 6)), (x + 3, y + 3))
                d.text((x + 6, y + t), f'{finish}-{n}', fill=(255, 255, 255))
            sh.save(sd / f'{pid}.png')
        print('sheets in', sd)


if __name__ == '__main__':
    main()
