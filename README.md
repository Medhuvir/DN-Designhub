# DN Design Hub

A free, running archive of design, UX and AI resources (links, downloads, explainers, and videos worth keeping) by [DN Creative](https://dannemirovsky.com). Static site, no build step, no framework.

- `index.html` — the whole hub, one page: Featured, the filterable Archive (filtered views are shareable URLs, `?tag=…&type=…#archive`), How it works, About, and a right rail with a short bio and LinkedIn / DN Creative / dannemirovsky.com / GitHub
- `resources.html`, `about.html` — redirect stubs for old links
- `404.html` — the not-found page
- `assets/js/data.js` — **edit this file to update content.** Single source of truth for every artifact and the tag taxonomy.
- `tools/thumbnails/` — renders branded card thumbnails with the DN topo generator (not published)
- `CLAUDE.md` — full working reference for whoever (or whatever agent) works on this next, including the brand rules in §6.

## Local preview

Open `index.html` directly in a browser, or serve the folder:

```
npx serve .
```

## Deploy

Static site — point Netlify at this folder, no build command required. See `netlify.toml`.

## Updating content

Don't hand-edit the HTML to add or change an artifact. Edit `assets/js/data.js` — see the comment block at the top of that file, and `CLAUDE.md` Section 3, for the full editing model. New entries usually arrive through the Notion inbox pipeline (`CLAUDE.md` §9).

For a new branded thumbnail, add an entry to `tools/thumbnails/thumbs.json` and run, from the repo root:

```
node tools/thumbnails/render.js            # renders entries without a jpg yet, records their seeds
```
