#!/usr/bin/env python3
"""
NOVA video pipeline
===================
Cleans the raw screen recordings in /videos and writes web-ready clips to public/video/
(served by Vite at /video/<name>.mp4, with a /video/<name>.jpg poster).

For every clip it
  * tracks and inpaints the Windows mouse cursor that the screen recorder captured
  * trims brand outros / the recorder's "Stop recording" tooltip (see JOBS)
  * optionally crops burned-in captions off the top of the frame
  * re-encodes to H.264 (+faststart); fades in/out for films; strips audio for scroll-scrub clips
    and encodes those with a 2-frame keyframe interval so scrubbing with video.currentTime is smooth

Usage:  python3 scripts/prepare-videos.py [name ...]      (no names = all)
Needs:  ffmpeg + ffprobe on PATH, numpy, opencv-python
"""
import subprocess, sys
from pathlib import Path
import cv2, numpy as np

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'videos'
OUT = ROOT / 'public' / 'video'

# raw file -> output.  start/dur in seconds. crop_top = fraction of frame height removed from the top (captions);
# crop_bottom = source pixels removed from the bottom (the recorder left a 1-5px UI sliver on some clips).
JOBS = {
    # scroll-scrub clips (home page)
    'buds-case':    dict(src='Recording 2026-11-22 073149.mp4', width=1440, scrub=True,  poster=0.0),
    'buds-colours': dict(src='Recording 2026-11-22 073409.mp4', width=1440, scrub=True,  crop_top=0.23, crop_bottom=6, poster=2.6),
    # films
    'aura-one-film':  dict(src='Recording 2026-11-21 152118.mp4', width=1280, start=0, dur=29.8, crf=25, poster=9.5),
    'aura-buds-film': dict(src='Recording 2026-11-21 151236.mp4', width=1280, start=0, dur=24.5, crf=25, crop_bottom=6, poster=4.9),
    'lifestyle-film': dict(src='Recording 2026-11-21 151952.mp4', width=1280, start=0, dur=43.6, crf=31, poster=24.5),
}


def make_cursor():
    """Cursor template: the standard Windows arrow, as captured at 1920 px."""
    sheet = SRC / '_cursor_template.png'
    if not sheet.exists():  # grab it from a frame where the cursor sits over a plain backdrop
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '4.4', '-i', str(SRC / JOBS['buds-case']['src']),
                        '-frames:v', '1', str(sheet)], check=True)
    im = cv2.imread(str(sheet))
    t = cv2.cvtColor(im[643:675, 160:183], cv2.COLOR_BGR2GRAY)
    shape = ((t > 225) | (t < 85)).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(shape)
    if n > 1:
        shape = (lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])).astype(np.uint8)
    return t, shape


TPL, SHAPE = make_cursor()
TH, TW = TPL.shape
GROW = 4
GROWN = np.zeros((TH + 2 * GROW, TW + 2 * GROW), np.uint8)
GROWN[GROW:GROW + TH, GROW:GROW + TW] = SHAPE
GROWN = cv2.dilate(GROWN, np.ones((2 * GROW + 1, 2 * GROW + 1), np.uint8))


def strip_cursor(frame):
    res = cv2.matchTemplate(cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY), TPL, cv2.TM_CCOEFF_NORMED)
    _, score, _, (x, y) = cv2.minMaxLoc(res)
    if score < 0.62:
        return frame, False
    mask = np.zeros(frame.shape[:2], np.uint8)
    y0, x0 = y - GROW, x - GROW
    ys, xs = max(0, y0), max(0, x0)
    ye, xe = min(frame.shape[0], y0 + GROWN.shape[0]), min(frame.shape[1], x0 + GROWN.shape[1])
    mask[ys:ye, xs:xe] = GROWN[ys - y0:ye - y0, xs - x0:xe - x0]
    return cv2.inpaint(frame, mask, 4, cv2.INPAINT_TELEA), True


def probe(path):
    out = subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                                   'stream=width,height,r_frame_rate:format=duration', '-of', 'default=nw=1', str(path)]).decode()
    d = dict(l.split('=') for l in out.split())
    num, den = d['r_frame_rate'].split('/')
    return int(d['width']), int(d['height']), float(num) / float(den), float(d['duration'])


def run(name, j):
    src = SRC / j['src']
    w, h, fps, total = probe(src)
    start, dur = j.get('start', 0), j.get('dur', total - j.get('start', 0))
    top = round(h * j.get('crop_top', 0)) // 2 * 2
    bottom = j.get('crop_bottom', 0)
    ow = j['width'] // 2 * 2
    oh = round((h - top - bottom) * ow / w) // 2 * 2
    scrub = j.get('scrub', False)
    OUT.mkdir(parents=True, exist_ok=True)
    dest = OUT / f'{name}.mp4'

    dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-ss', str(start), '-t', str(dur), '-i', str(src),
                            '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], stdout=subprocess.PIPE, bufsize=10 ** 8)
    vf = []
    if not scrub:
        vf = ['-vf', f'fade=t=in:st=0:d=0.5,fade=t=out:st={dur - 0.7:.2f}:d=0.7']
    enc_cmd = ['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{ow}x{oh}', '-r', f'{fps}', '-i', '-']
    if not scrub:
        enc_cmd += ['-ss', str(start), '-t', str(dur), '-i', str(src), '-map', '0:v', '-map', '1:a',
                    '-af', f'afade=t=in:st=0:d=0.5,afade=t=out:st={dur - 0.7:.2f}:d=0.7', '-c:a', 'aac', '-b:a', '112k']
    enc_cmd += vf + ['-c:v', 'libx264', '-preset', 'medium', '-crf', str(j.get('crf', 22)), '-pix_fmt', 'yuv420p', '-movflags', '+faststart']
    if scrub:
        enc_cmd += ['-g', '2', '-bf', '0', '-an']
    else:
        enc_cmd += ['-g', '48', '-shortest']
    enc_cmd += [str(dest)]
    enc = subprocess.Popen(enc_cmd, stdin=subprocess.PIPE)

    fsize = w * h * 3
    n = hit = 0
    while True:
        buf = dec.stdout.read(fsize)
        if len(buf) < fsize:
            break
        fr = np.frombuffer(buf, np.uint8).reshape(h, w, 3).copy()
        fr, was = strip_cursor(fr)
        hit += was
        fr = fr[top:h - bottom]
        fr = cv2.resize(fr, (ow, oh), interpolation=cv2.INTER_AREA)
        enc.stdin.write(fr.tobytes())
        n += 1
    enc.stdin.close(); enc.wait(); dec.wait()

    # poster
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{j.get("poster", 0):.2f}', '-i', str(dest), '-frames:v', '1',
                    '-q:v', '4', str(OUT / f'{name}.jpg')], check=True)
    print(f'{name}: {n} frames, cursor removed from {hit}, {dest.stat().st_size / 1e6:.1f} MB, {ow}x{oh}', flush=True)


if __name__ == '__main__':
    names = sys.argv[1:] or list(JOBS)
    for nm in names:
        run(nm, JOBS[nm])
