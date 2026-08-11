# DN Design Hub — Working Reference

*This file is for whoever (human or Claude) works on this codebase next. It explains what this thing is, why it's built the way it is, and how to keep extending it correctly. **This document is meant to evolve.** Update it whenever the taxonomy, scope, or structure changes — don't let it go stale the way a one-shot README would.*

---

## 1. What this project is

DN Creative's own running archive — a sharable web hub for the links, downloads, explainers, videos, frameworks, and skills Dan Nemirovsky comes across in the day-to-day and wants to keep, revisit, and pass along. Unlike `conspectus-design-hub` (a client audit deliverable with a defined end state), this hub has no finish line — it's meant to grow indefinitely as an evolving personal reference.

**Two pages, by design — keep it this small unless there's a real reason to grow it:**
- `index.html` — **Home.** A short explainer of what this hub is and how it's organized, plus the 4 artifacts currently pinned as the "top of mind" set.
- `resources.html` — **Resources.** The full archive, filterable by format and by topic tag.

This is scaffolding built ahead of real content — see §8 (Status) for exactly what's real vs. placeholder right now.

---

## 2. Who this is for and why it exists

This is Dan's own reference, not a client deliverable — but built to be handed to a collaborator, a client, or a friend when "here's a good resource on X" comes up in conversation. That dual purpose (personal + sharable) is why it stays organized rather than living as browser bookmarks: the bar is "would I be comfortable sending someone this link," not just "did I find this useful once."

---

## 3. The data model — how to actually update this thing

**`assets/js/data.js` is the single source of truth.** Do not hand-edit either HTML page to add, change, re-tag, or re-pin an artifact — edit the data file and both pages re-render from it.

- `ARTIFACTS` — the array of every artifact. Each has an `id`, `title`, `description`, `url`, `type`, `tags` (array), `pinned` (bool), `dateAdded`, and optional `source`.
- `type` is the **format** — exactly one of `"link"` / `"download"` / `"explainer"` / `"video"`. This is what the thing *is*, not what it's about. Copy/icon source for the badges: `TYPE_COPY`.
- `tags` is the **topic** — one or more keys from `TAGS`. This is what the thing is *about*. An artifact can and often should carry more than one tag.
- `pinned: true` surfaces an artifact in Home's pinned row. **Keep this at exactly 4 at a time** — Home's grid is built around a 4-up layout, not a scrolling list. When something new earns a pin, demote one of the current four rather than letting the count drift past 4 (`main.js` only renders the first 4 pinned items if it does drift, but don't rely on that — it's a safety net, not the intended workflow). **Pinned order is the `ARTIFACTS` array order, not `dateAdded`** — to make something the Nth pinned card on Home, move its object to the Nth position among pinned entries in the array. This is a deliberate design choice so "pin this as the 2nd card" is a literal, one-line edit.
- **To add a new artifact:** copy an existing object, give it a unique `id`, fill in real values, and delete the `placeholder: true` flag (or delete the object if you're replacing a seed entry outright rather than editing it in place).
- **To retire an artifact:** delete the object. There's no History/archive page for this hub the way there is on the Conspectus hub — dead links just get removed, nothing here needs an audit trail.

`assets/js/main.js` handles rendering (pinned grid on Home, full grid + filters on Resources), the tag/format filter chips, and the mobile hamburger nav. It shouldn't need edits for routine content updates — only if the interaction model itself changes (e.g. adding a search box, changing how pins are chosen).

---

## 4. The tag taxonomy — v2, still not locked

**Renegotiated August 11, 2026, replacing the original v1 8-tag list** (see §8 for the change log) — still treat `TAGS` in `data.js` as a working proposal, not a spec:

| key | label | for |
|---|---|---|
| `design` | Design | Visual craft, design systems, **and branding/identity** — branding doesn't get its own tag, it lives here |
| `engineering` | Engineering | Dev/technical resources — code, tooling, technical implementation |
| `ux` | UX | Interaction design, product experience, UX craft |
| `research` | Research | Research methods and findings — user research, market/competitive reads |
| `skills-agents` | Skills & Agents | Claude skills, agent workflows, AI tooling worth reusing |
| `video` | Video | Talks, demos, walkthroughs — **deliberately overlaps with the Video format type**, see note below |
| `inspiration` | Inspiration + Cool Shit | Things worth looking at just because they're great — no further justification needed |

**The Video tag/format overlap is intentional, not an oversight** — flagged during the v1→v2 renegotiation (an artifact's `type` can be `"video"` *and* it can carry the `video` tag at the same time) and kept anyway at Dan's explicit call. Don't "fix" this by removing the tag or merging it into the format filter.

**Business/Freelance is gone, not folded anywhere** — v1 had a `business` tag; v2 doesn't replace it with anything. If freelance/pricing/contracts content shows up, that's an open question to raise with Dan rather than silently reviving the old tag or mis-filing it under Design.

Discipline for growing this list as real content gets added:
- **Merge before you multiply.** If a new tag would only ever apply to 1–2 artifacts, it's probably a more specific case of one already in the table above — fold it in rather than fragmenting the filter list.
- If a tag stops earning its keep (nothing tagged with it, or everything tagged with it also carries a broader tag that covers it), cut it. `main.js` builds the filter chips directly from `TAGS`, so removing a key removes its chip automatically — no HTML to touch.
- When the taxonomy does get renegotiated for real (not just incrementally), update this table and the `TAGS` object together, and note the change in §8 below the way the Conspectus hub logs taxonomy shifts in its own CLAUDE.md.

---

## 5. Deployment

Static site, no build step, no framework, no package.json. Just HTML/CSS/vanilla JS — same approach as `conspectus-design-hub`.

- **Local preview:** open `index.html` directly, or run any static server (`python3 -m http.server`, `npx serve`, etc.) from this folder.
- **Netlify:** point Netlify at this folder as the publish directory. No build command needed. `netlify.toml` is included with sane defaults (publish `.`, no build command).
- **Fonts:** Bebas Neue + DM Sans load from Google Fonts CDN — no local font files to manage.
- **Downloads:** the `/downloads` folder is where any `type: "download"` artifact's actual file should live if it isn't hosted elsewhere — link `url` straight at the file (e.g. `downloads/whatever.pdf`).

---

## 6. Brand rules to keep enforcing

This hub's chrome is **DN Creative's own brand system** (Bebas Neue + DM Sans, Pitch Black / Warm White / Blaze Orange, topo texture) — unlike `conspectus-design-hub`, there's no second brand living inside this one to keep separate from the chrome. Full system: `dn-creative-branding` skill / brand design system doc.

- **Palette:** Pitch Black `#0A0A0A`, Warm White `#F5F3EE`, Blaze Orange `#FF5E1A` carry everything. Orange is a signal, not a decoration — reserve it for the one clear focal use per screen (currently: the pinned-card left-rule accent and CTA links). Don't add more orange surfaces than that to a single page.
- **Type:** Bebas Neue for all display/headline type, DM Sans for everything else. Never introduce a third chrome typeface.
- **Spacing:** 8px base unit (`--space-1` through `--space-8` in `assets/css/style.css`).
- **Motion:** `cubic-bezier(0.16, 1, 0.3, 1)` easing everywhere. No bounce/overshoot. Staggered reveals for grouped content.
- **Never** pure `#000000` or pure `#FFFFFF` — always Pitch Black / Warm White.
- `assets/css/style.css` carries the shared chrome (nav, hero, footer, type scale, filter chips) — the same file shape as the Conspectus hub's `style.css`. `assets/css/hub.css` carries this hub's own component (the artifact card, pinned grid, format-explainer cards) — the equivalent of that hub's `cns.css`, kept separate so chrome and content-card styling can't tangle.

---

## 7. Where this diverges from the `conspectus-design-hub` pattern it's modeled on

Worth naming explicitly so nobody "fixes" these back to match the sibling project by habit:

- **No confidence tiers.** The Conspectus hub's Verified/Observed/Confirmed discipline exists because that hub makes claims about someone else's product that need a trust signal. This hub just curates things Dan found useful — there's nothing to verify.
- **No History page.** Findings on the Conspectus hub need an audit trail because stakeholders track what got resolved. Artifacts here don't get "resolved" — they either stay useful (stay in `ARTIFACTS`) or don't (get deleted). No in-between state worth a timeline.
- **No dual-brand split.** `design-system.html` on the Conspectus hub deliberately mixes DN Creative's chrome with The Conspectus's own token language, because it's documenting a third party's system. Nothing in this hub documents anyone's design system but the artifacts' own source pages (which stay off-hub, behind their own links) — so there's only ever one brand voice here.

---

## 8. Status (August 11, 2026)

Initial structure stood up: two pages, the data-driven card/filter pattern, and a v1 tag taxonomy (§4), all modeled directly on `conspectus-design-hub`'s architecture per Dan's brief. **`ARTIFACTS` in `data.js` currently holds 8 placeholder entries (`placeholder: true`), not real curated content** — no actual links, downloads, explainers, or videos have been supplied yet, and none were guessed or invented to fill the gap. Each placeholder's `description` field doubles as inline documentation of what that slot's format/pinned/tag combination is for, so the schema is self-explanatory once real artifacts start replacing them. Next real session's first job should be swapping in Dan's actual finds and deleting the placeholders — see §3 for the exact edit pattern, and revisit §4's tag table once there's enough real content to see which tags actually earn their keep.

**Same-day addendum — first real artifact added.** The `seed-01` placeholder pinned slot is now the **UX / AI Workflow Skill Toolkit** (`id: "ux-skills-toolkit"`): 11 Claude skills (double-diamond, ux-research-methods, ux-personas, general-design-review, cognitive-load-conversion, persuasive-ux, ai-tuners, ai-inputs, ai-governors, ai-trust-builders, ai-identifiers) for scoping, auditing, and assessing UX/service-design work, delivered as a zip. File lives at `downloads/ux-skills-toolkit.zip` (the source `.zip` as supplied, unmodified — not re-packaged or edited). Originally tagged `ai-workflows` + `ux-research` + `frameworks` under the v1 taxonomy — see the same-day taxonomy addendum immediately below for what it's tagged now.

**Same-day addendum — tag taxonomy renegotiated from v1 to v2, first real artifact retagged.** Dan replaced the original 8-tag v1 list with a tighter 7-tag v2 (§4): `design`, `engineering`, `ux`, `research`, `skills-agents`, `video`, `inspiration` (relabeled "Inspiration + Cool Shit"). Two explicit calls worth remembering so they don't get "corrected" back: (1) `video` deliberately coexists with the `video` format `type` — flagged as a possible redundancy, Dan said ignore it; (2) `branding` was folded into `design` rather than kept as its own tag or moved under `inspiration`. `business` (v1's Freelance & Business) was dropped outright with no replacement — not folded anywhere, see §4's note on this. The toolkit's tags moved from `ai-workflows`/`ux-research`/`frameworks` to `skills-agents`/`ux`/`research`. All 7 placeholder entries (`seed-02` through `seed-08`) were retagged to the v2 keys and, where their illustrative content no longer matched a surviving tag (the old "Business" and "Design Systems" example slots), rewritten so every v2 tag has at least one example artifact — `seed-06` now specifically documents the branding→design fold, `seed-07` covers `engineering`.

**Same-day addendum — second real artifact added, thumbnail support built, a real network gap found.** Added Figma's resource-library page "10 Claude Skills for Design To Improve Workflows" (`id: "figma-claude-skills-for-design"`, tag `design`, unpinned — not requested for Home). This is the first artifact added via a plain URL rather than an uploaded file, and it surfaced a real constraint worth remembering: **this environment's network egress policy blocks figma.com outright** (confirmed three ways — `curl` CONNECT got a 403 from the egress proxy, the `WebFetch` tool returned `EGRESS_BLOCKED`, and a headless-Chromium `page.goto` timed out with `ERR_TUNNEL_CONNECTION_FAILED`; a handful of other unrelated CDN hosts were tried too and all failed identically, so this reads as a default-deny egress policy for arbitrary external hosts, not a figma.com-specific block). The title and description came from Google-indexed search snippets instead (via the hosted `WebSearch` tool, which isn't subject to the same egress block) — accurate as far as they go, but **no thumbnail could be pulled**, so the `thumbnail` field was left off this entry rather than guessed. Card component now supports an optional `thumbnail` (16:9 image, top of card) for whenever a real one gets supplied — see the field note in `data.js`'s header comment. If a future session hits the same wall trying to fetch an external page directly, don't burn time retrying `curl`/`WebFetch` against it — go straight to `WebSearch` for text, and ask Dan to supply images directly (upload, or a working direct image URL) since automated image pulls aren't reliable here.

**Same-day addendum — Figma entry got its thumbnail, promoted to pinned #2, and a full-width CTA band shipped on Home.** Dan supplied the thumbnail image directly (upload); it's stored at `assets/img/thumbs/figma-claude-skills-for-design.png` and wired into the entry's `thumbnail` field. The Figma artifact is now `pinned: true`, positioned as the 2nd pinned card — this is what prompted the pinned-order behavior change logged in §3: `renderPinned()` in `main.js` used to always re-sort pinned items by `dateAdded` descending, which made "make this the Nth card" impossible to guarantee since same-day dates ties broke on array order anyway. It now just takes the first 4 `pinned: true` entries in array order, full stop — reordering Home's pinned row is now always a data.js array-position edit, nothing more. `seed-04` was demoted (`pinned: false`) to hold the pinned count at 4, not deleted. Also added: a full-bleed `.cta-band` section between Pinned and "How this hub works" on `index.html` — dark topo-texture background (reusing the same `.topo-bg` device the hero uses), one orange `.btn-cta` button ("View All Resources →") linking to `resources.html`, styled per the DN Creative brand skill's CTA/cover-slide language (dark bg, topo at ~10%, Bebas Neue, one orange focal point, standard button-lift hover). New CSS lives in `style.css` (`.cta-band`, `.btn-cta`) since it's generic chrome, not resources-card-specific — reusable on any future page that wants the same full-width CTA treatment.

**Same-day addendum — `main` branch created and pushed as the production branch, at Dan's direction.** This repo had no `main`/production branch before this point — only the feature branch existed on GitHub. Created `main` from the feature branch's current state and pushed it (`git push -u origin main`); GitHub does not yet show it as the *default* branch (no tool available in this environment to flip that repo setting — it's a manual step in GitHub's Settings → Branches, or Dan can do it via the GitHub UI). Dan confirmed this will be a Netlify project; `netlify.toml` was already in place from the initial scaffold (`publish = "."`, no build command) so the repo needs no further changes to deploy — connecting Netlify to `main` is the only remaining step, and it's outside what this session can do (no Netlify credentials/connector here).

**This file, and `data.js`, should be updated together whenever the taxonomy changes or the page structure grows past two pages — don't let the narrative in this file drift from what the data actually shows.**
