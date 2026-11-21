// DN Design Hub — thumbnail renderer
// Draws every entry in thumbs.json with the live topo generator in still
// mode (assets/js/topo-motion.js), a Pitch Black overlay, and the icon/label
// in Bebas Neue + DM Sans. Output: assets/img/thumbs/<id>.jpg, 1600x900.
//
//   node tools/thumbnails/render.js                 # render entries missing a jpg
//   node tools/thumbnails/render.js --all           # re-render everything (keeps seeds)
//   node tools/thumbnails/render.js --fonts <dir>   # serve local woff2s if Google Fonts is unreachable
//
// Run from the repo root. A new entry needs only {id, icon, title, sub} in
// thumbs.json; a fresh seed is generated and written back, so the same map
// can be reproduced later. Never reuse another entry's seed.
const { chromium } = require('playwright');
const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const SPEC = path.join(__dirname, 'thumbs.json');
const args = process.argv.slice(2);
const all = args.includes('--all');
const fontsDir = args.includes('--fonts') ? args[args.indexOf('--fonts') + 1] : null;

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
function serve() {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      const file = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!file.startsWith(ROOT) || !fs.existsSync(file)) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    }).listen(0, () => resolve(srv));
  });
}

async function localFonts(page) {
  const face = (fam, w, st, file) => `@font-face{font-family:'${fam}';font-weight:${w};font-style:${st};src:url(/__fonts/${file}) format('woff2');}`;
  let css = face('Bebas Neue', 400, 'normal', 'bebas-neue-latin-400-normal.woff2');
  for (const w of [400, 500, 600]) css += face('DM Sans', w, 'normal', `dm-sans-latin-${w}-normal.woff2`);
  await page.route('**/fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: css }));
  await page.route('**/__fonts/**', r => r.fulfill({ status: 200, contentType: 'font/woff2',
    body: fs.readFileSync(path.join(fontsDir, r.request().url().split('/__fonts/')[1])) }));
}

(async () => {
  const spec = JSON.parse(fs.readFileSync(SPEC, 'utf8'));
  const srv = await serve();
  const port = srv.address().port;
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const page = await browser.newPage();
  if (fontsDir) await localFonts(page);

  // Entries default to a card thumbnail (thumb.html, 1600x900, assets/img/thumbs/<id>.jpg).
  // Others set template / width / height / out, e.g. the social share image:
  //   { "id": "og-hub", "template": "og", "width": 1200, "height": 630,
  //     "out": "assets/img/og/hub.jpg", "eyebrow": "…", "title": "…", "sub": "…", "url": "…" }
  const FIELDS = ['icon', 'title', 'sub', 'eyebrow', 'url'];
  for (const t of spec) {
    const out = path.join(ROOT, t.out || path.join('assets/img/thumbs', t.id + '.jpg'));
    if (!all && fs.existsSync(out)) continue;
    if (!t.seed) t.seed = crypto.randomBytes(4).readUInt32BE(0);
    const params = { seed: t.seed };
    for (const k of FIELDS) if (t[k]) params[k] = t[k];
    await page.setViewportSize({ width: t.width || 1600, height: t.height || 900 });
    await page.goto(`http://localhost:${port}/tools/thumbnails/${t.template || 'thumb'}.html?${new URLSearchParams(params)}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('body[data-ready="1"]');
    const bebas = await page.evaluate(() => document.fonts.check('104px "Bebas Neue"'));
    if (!bebas) throw new Error(`Bebas Neue did not load for ${t.id}: pass --fonts <dir> with the woff2 files`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await page.screenshot({ path: out, type: 'jpeg', quality: 84 });
    console.log(`${path.relative(ROOT, out)}  seed ${t.seed}`);
  }

  fs.writeFileSync(SPEC, JSON.stringify(spec, null, 2) + '\n');
  await browser.close();
  srv.close();
})();
