// Runs a Python script with whichever interpreter exists: `py -3` (Windows launcher), `python3`, or `python`.
// Usage: node scripts/run-python.mjs scripts/prepare-videos.py [args...]
import { spawnSync } from 'node:child_process';

const [script, ...args] = process.argv.slice(2);
const candidates = [['py', ['-3']], ['python3', []], ['python', []]];

for (const [cmd, pre] of candidates) {
  const probe = spawnSync(cmd, [...pre, '--version'], { encoding: 'utf8' });
  const ok = !probe.error && probe.status === 0 && /Python 3\./.test(`${probe.stdout}${probe.stderr}`);
  if (!ok) continue;
  const run = spawnSync(cmd, [...pre, script, ...args], { stdio: 'inherit' });
  process.exit(run.status ?? 1);
}

console.error(`
Could not find Python 3.

  1. Install it from https://www.python.org/downloads/ (tick "Add python.exe to PATH" on Windows).
  2. Install the libraries:   pip install pillow numpy scipy opencv-python
  3. For videos you also need ffmpeg on your PATH (Windows: winget install Gyan.FFmpeg).
  4. Open a NEW terminal and run the command again.

You only need this to regenerate the media. The processed files are already in the project.
`);
process.exit(1);
