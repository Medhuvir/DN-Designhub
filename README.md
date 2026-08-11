# DN Design Hub

A running, sharable archive of design/UX/AI artifacts — links, downloads, explainers, and videos worth keeping — by [DN Creative](https://dannemirovsky.com). Static site, no build step, no framework.

- `index.html` — Home: explainer + the 4 artifacts currently pinned
- `resources.html` — the full archive, filterable by format and topic tag
- `assets/js/data.js` — **edit this file to update content.** Single source of truth for every artifact and the tag taxonomy.
- `CLAUDE.md` — full working reference for whoever (or whatever agent) works on this next.

## Local preview

Open `index.html` directly in a browser, or serve the folder:

```
npx serve .
```

## Deploy

Static site — point Netlify at this folder, no build command required. See `netlify.toml`.

## Updating content

Don't hand-edit the HTML to add or change an artifact. Edit `assets/js/data.js` — see the comment block at the top of that file, and `CLAUDE.md` Section 3, for the full editing model.

**Current state:** the archive is seeded with 8 clearly-marked placeholder entries (`placeholder: true`) so the structure renders and demonstrates the schema. No real artifacts have been added yet — see `CLAUDE.md` §8.
