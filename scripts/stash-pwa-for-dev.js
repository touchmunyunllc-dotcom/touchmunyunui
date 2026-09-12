/**
 * Move committed production service worker files aside during `npm run dev`
 * so localhost never serves stale precached _next bundles.
 */
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const stashDir = path.join(publicDir, '.pwa-stash-dev');

const patterns = [/^sw\.js$/i, /^workbox-.*\.js$/i, /^sw\.js\.map$/i, /^workbox-.*\.js\.map$/i];

if (!fs.existsSync(publicDir)) process.exit(0);

if (!fs.existsSync(stashDir)) fs.mkdirSync(stashDir, { recursive: true });

for (const name of fs.readdirSync(publicDir)) {
  if (!patterns.some((re) => re.test(name))) continue;
  const from = path.join(publicDir, name);
  const to = path.join(stashDir, name);
  try {
    if (fs.existsSync(to)) fs.unlinkSync(to);
    fs.renameSync(from, to);
    console.log(`[dev] stashed ${name} (PWA)`);
  } catch (err) {
    console.warn(`[dev] could not stash ${name}:`, err.message);
  }
}
