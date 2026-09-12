const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const stashDir = path.join(publicDir, '.pwa-stash-dev');

if (!fs.existsSync(stashDir)) process.exit(0);

for (const name of fs.readdirSync(stashDir)) {
  const from = path.join(stashDir, name);
  const to = path.join(publicDir, name);
  try {
    if (fs.existsSync(to)) fs.unlinkSync(to);
    fs.renameSync(from, to);
    console.log(`[dev] restored ${name}`);
  } catch (err) {
    console.warn(`[dev] could not restore ${name}:`, err.message);
  }
}

try {
  if (fs.readdirSync(stashDir).length === 0) fs.rmdirSync(stashDir);
} catch {
  // ignore
}
