// Renders scripts/og-image.html to public/og-default.png (1200x630) using a
// local headless browser. Run manually, not part of the build.
//
//   node scripts/build-og-image.mjs
import { execFile } from 'node:child_process';
import { access, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);

const CANDIDATES = [
  process.env.CHROME_BIN,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

const source = fileURLToPath(new URL('./og-image.html', import.meta.url));
const output = fileURLToPath(new URL('../public/og-default.png', import.meta.url));

let chrome;
for (const candidate of CANDIDATES) {
  try {
    await access(candidate);
    chrome = candidate;
    break;
  } catch {
    /* keep looking */
  }
}

if (!chrome) {
  console.error('No Chrome/Chromium binary found. Set CHROME_BIN and retry.');
  process.exit(1);
}

await rm(output, { force: true });

await run(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--hide-scrollbars',
  '--force-device-scale-factor=1',
  '--allow-file-access-from-files',
  '--window-size=1200,630',
  `--screenshot=${output}`,
  `file://${source}`,
]);

console.log(`Wrote ${output}`);
