// DN Design Hub — thumbnail renderer
// Draws every entry in thumbs.json with the live topo generator in still
// mode (assets/js/topo-motion.js), a Pitch Black overlay, and the icon/label
// in Bebas Neue + DM Sans. Output: assets/img/thumbs/<id>.jpg, 1600x900.
//
//   node tools/thumbnails/render.js                 # render entries missing a jpg
//   node tools/thumbnails/render.js --all           # re-render everything (keeps seeds)
//   node tools/thumbnails/render.js --og            # share cards (1200x630) for every resource and
//                                                   # topic in data.js missing one; seeds in og.json
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
const ogMode = args.includes('--og');

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
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

(async () => {
  // --og: one share card per resource (assets/img/og/r/<id>.jpg) and per topic
  // (assets/img/og/t/<key>.jpg), built from data.js; seeds live in og.json
  const OG_SEEDS = path.join(__dirname, 'og.json');
  let spec, seeds = {};
  if (ogMode) {
    const hub = require(path.join(ROOT, 'src/_data/hub.js'));
    const css = fs.readFileSync(path.join(ROOT, 'assets/css/hub.css'), 'utf8');
    const hue = {};
    for (const m of css.matchAll(/\.t-([a-z0-9-]+)\s*\{\s*--t:\s*(#[0-9A-Fa-f]{6})/g)) hue[m[1]] = m[2];
    const chips = tags => JSON.stringify(tags.map(k => ({ label: hub.tags[k].label, color: hue[k] || '#C8C6C0' })));
    if (fs.existsSync(OG_SEEDS)) seeds = JSON.parse(fs.readFileSync(OG_SEEDS, 'utf8'));
    const og = (id, o) => Object.assign({ id, template: 'og', width: 1200, height: 630, out: `assets/img/og/${id}.jpg`, seed: seeds[id] }, o);
    spec = [
      ...hub.resources.map(r => {
        const [title, ...rest] = r.title.split(' — ');
        let firstSentence = r.description.split(/(?<=[.!?])\s/)[0];
        if (firstSentence.length > 110) firstSentence = firstSentence.slice(0, 107).replace(/[\s,;:—–-]+\S*$/, '') + '…';
        return og('r/' + r.id, {
          eyebrow: hub.types[r.type].label + (r.source ? ' · ' + r.source : ''),
          title, sub: rest.join(' — ') || firstSentence, chips: chips(r.tags),
          url: 'hub.dncreative.studio/r/' + r.id,
        });
      }),
      ...hub.topics.map(t => og('t/' + t.key, {
        eyebrow: 'Topic · ' + t.resources.length + ' resource' + (t.resources.length === 1 ? '' : 's'),
        title: t.label, sub: t.desc, chips: chips([t.key]), url: 'hub.dncreative.studio/topics/' + t.key,
      })),
    ];
  } else {
    spec = JSON.parse(fs.readFileSync(SPEC, 'utf8'));
  }
  const srv = await serve();
  const port = srv.address().port;
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const page = await browser.newPage();

  // Entries default to a card thumbnail (thumb.html, 1600x900, assets/img/thumbs/<id>.jpg).
  // Others set template / width / height / out, e.g. the social share image:
  //   { "id": "og-hub", "template": "og", "width": 1200, "height": 630,
  //     "out": "assets/img/og/hub.jpg", "eyebrow": "…", "title": "…", "sub": "…", "url": "…" }
  const FIELDS = ['icon', 'title', 'sub', 'eyebrow', 'url', 'chips'];
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
    if (!bebas) throw new Error(`Bebas Neue did not load for ${t.id} (assets/fonts/ should hold the woff2 files)`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await page.screenshot({ path: out, type: 'jpeg', quality: 84 });
    console.log(`${path.relative(ROOT, out)}  seed ${t.seed}`);
  }

  if (ogMode) {
    for (const t of spec) seeds[t.id] = t.seed;
    fs.writeFileSync(OG_SEEDS, JSON.stringify(seeds, null, 2) + '\n');
  } else {
    fs.writeFileSync(SPEC, JSON.stringify(spec, null, 2) + '\n');
  }
  await browser.close();
  srv.close();
})();
