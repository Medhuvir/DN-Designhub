# DN Design Hub

A free, running archive of design, UX and AI resources (links, downloads, explainers, and videos worth keeping) by [DN Creative](https://dannemirovsky.com). Static site built with [Eleventy](https://www.11ty.dev/): every page is pre-rendered, no client-side framework.

- `assets/js/data.js` — **edit this file to update content.** Single source of truth for every resource and the topic list. The build checks it and fails on a typo.
- `src/` — page templates: the hub (`index.njk`), one page per resource (`resource.njk` → `/r/<id>/`), one per topic (`topic.njk` → `/topics/<key>/`), 404, sitemap, Atom feed, `llms.txt`, robots.txt, and redirect stubs for old URLs
- `src/_data/` — site constants (`site.js`) and the data loader (`hub.js`)
- `lib/` — build helpers: line icons, JSON-LD
- `assets/` — CSS, images, and the two browser scripts (`main.js`: nav, filters, reveal; `topo-motion.js`: the hero topo)
- `tools/thumbnails/` — renders branded card thumbnails with the DN topo generator (not published)
- `CLAUDE.md` — full working reference for whoever (or whatever agent) works on this next, including the brand rules in §6.

## Local preview

```
npm install
npm start          # dev server at http://localhost:8820, rebuilds on save
```

`npm run build` writes the site to `_site/`.

## Deploy

Netlify runs `npm run build` and publishes `_site` (see `netlify.toml`).

## Updating content

Don't hand-edit templates to add or change a resource. Edit `assets/js/data.js` — see the comment block at the top of that file, and `CLAUDE.md` Section 3, for the full editing model. A resource's `id` is its URL (`/r/<id>/`), so don't rename one once it's live. New entries usually arrive through the Notion inbox pipeline (`CLAUDE.md` §9).

For a new branded thumbnail, add an entry to `tools/thumbnails/thumbs.json` and run, from the repo root:

```
node tools/thumbnails/render.js            # renders entries without a jpg yet, records their seeds
```
