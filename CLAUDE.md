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
- `pinned: true` surfaces an artifact in Home's pinned row. **Keep this at exactly 4 at a time** — Home's grid is built around a 4-up layout, not a scrolling list. When something new earns a pin, demote one of the current four rather than letting the count drift past 4 (`main.js` will only render the 4 most-recently-dated pinned items if it does drift, but don't rely on that — it's a safety net, not the intended workflow).
- **To add a new artifact:** copy an existing object, give it a unique `id`, fill in real values, and delete the `placeholder: true` flag (or delete the object if you're replacing a seed entry outright rather than editing it in place).
- **To retire an artifact:** delete the object. There's no History/archive page for this hub the way there is on the Conspectus hub — dead links just get removed, nothing here needs an audit trail.

`assets/js/main.js` handles rendering (pinned grid on Home, full grid + filters on Resources), the tag/format filter chips, and the mobile hamburger nav. It shouldn't need edits for routine content updates — only if the interaction model itself changes (e.g. adding a search box, changing how pins are chosen).

---

## 4. The tag taxonomy — provisional, expected to change

**This is v1 and explicitly not locked** — the brief that produced this hub said as much ("tags are still to be scoped"). Treat `TAGS` in `data.js` as a starting proposal, not a spec:

| key | label | for |
|---|---|---|
| `ai-workflows` | AI & Agent Workflows | Tools, prompting patterns, agent setups worth reusing |
| `design-systems` | Design Systems & UI | Component libraries, token systems, UI craft references |
| `branding` | Branding & Identity | Identity systems, logo/type/color decisions, brand strategy |
| `ux-research` | UX Research & Strategy | Research methods, behavioral principles, product-strategy reads |
| `frameworks` | Frameworks & Methods | Named processes and mental models for running design work |
| `business` | Freelance & Business | Pricing, contracts, positioning, running a design practice |
| `inspiration` | Inspiration & Reference | Portfolio/visual reference — worth looking at, not necessarily using |
| `tools` | Tools & Software | Software worth having in the kit |

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

**Same-day addendum — first real artifact added.** The `seed-01` placeholder pinned slot is now the **UX / AI Workflow Skill Toolkit** (`id: "ux-skills-toolkit"`): 11 Claude skills (double-diamond, ux-research-methods, ux-personas, general-design-review, cognitive-load-conversion, persuasive-ux, ai-tuners, ai-inputs, ai-governors, ai-trust-builders, ai-identifiers) for scoping, auditing, and assessing UX/service-design work, delivered as a zip. File lives at `downloads/ux-skills-toolkit.zip` (the source `.zip` as supplied, unmodified — not re-packaged or edited). Tagged `ai-workflows` + `ux-research` + `frameworks` since it genuinely spans all three; that's worth watching as more artifacts land — if most real entries end up carrying 3 tags, the taxonomy in §4 is probably still too coarse. 7 placeholders (`seed-02` through `seed-08`) remain and still need replacing.

**This file, and `data.js`, should be updated together whenever the taxonomy changes or the page structure grows past two pages — don't let the narrative in this file drift from what the data actually shows.**
