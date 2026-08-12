# DN Design Hub — Working Reference

*This file is for whoever (human or Claude) works on this codebase next. It explains what this thing is, why it's built the way it is, and how to keep extending it correctly. **This document is meant to evolve.** Update it whenever the taxonomy, scope, or structure changes — don't let it go stale the way a one-shot README would.*

---

## 1. What this project is

DN Creative's own running archive — a sharable web hub for the links, downloads, explainers, videos, frameworks, and skills Dan Nemirovsky comes across in the day-to-day and wants to keep, revisit, and pass along. Unlike `conspectus-design-hub` (a client audit deliverable with a defined end state), this hub has no finish line — it's meant to grow indefinitely as an evolving personal reference.

**Three pages, by design — keep it this small unless there's a real reason to grow it:**
- `index.html` — **Home.** A short explainer of what this hub is and how it's organized, plus the 4 artifacts currently pinned as the "top of mind" set.
- `resources.html` — **Resources.** The full archive, filterable by format and by topic tag.
- `about.html` — **About.** A short, personal bio page for Dan — added August 12, 2026, see §8's same-day addendum for what it does and doesn't carry over from the source `dncreative.studio/about` page.

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
- `pinned: true` surfaces an artifact in Home's pinned row. **Keep this at exactly 5 at a time** (raised from 4 on August 12, 2026, when the pinned row was refactored to a single full-width column — see §8) — Home's row is built as a capped stack, not an unbounded scrolling list. When something new earns a pin, demote one of the current five rather than letting the count drift past 5 (`main.js` only renders the first 5 pinned items if it does drift, but don't rely on that — it's a safety net, not the intended workflow). **Pinned order is the `ARTIFACTS` array order, not `dateAdded`** — to make something the Nth pinned card on Home, move its object to the Nth position among pinned entries in the array. This is a deliberate design choice so "pin this as the 2nd card" is a literal, one-line edit.
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

**New-day addendum (August 12, 2026) — two more real artifacts added, all pinned slots now real, placeholders hidden from view.** `seed-02` and `seed-03` were replaced in place with two GitHub repos: **Awesome UX Skills** (`id: "awesome-ux-skills"`, github.com/tommyjepsen/awesome-ux-skills — 30+ Claude skills for UX research/analysis/AI product design, tagged `skills-agents`/`ux`/`research`) and **UI/UX Pro Max** (`id: "ui-ux-pro-max-skill"`, a single dense `SKILL.md` on nextlevelbuilder/ui-ux-pro-max-skill acting as a design-intelligence database plus multi-framework implementation guidance, tagged `skills-agents`/`design`/`engineering`). Both are `type: "link"` and kept their pinned-slot positions (#3 and #4), preserving §3's array-order convention. Content for both came from `WebFetch` directly against the GitHub URLs — unlike the Figma block logged above, github.com was *not* egress-blocked, so no `WebSearch` fallback was needed this time. Two new thumbnails were **generated, not sourced**: a DN-mark-on-topo-texture image for the toolkit (`assets/img/thumbs/ux-skills-toolkit.png`, filling the one pinned card that still lacked one) and a GitHub-octocat-on-topo-texture image reused as the visual treatment for both new GitHub entries (`assets/img/thumbs/awesome-ux-skills.png`, `assets/img/thumbs/ui-ux-pro-max-skill.png`, separate files, identical design intentionally — Dan asked for the same treatment on both). All three were rendered locally via headless Chromium screenshotting an HTML/CSS mock of the brand's `.topo-bg` device (Bebas Neue + DM Sans from Google Fonts, which was reachable) rather than hand-drawn or sourced externally — same 1440×720 dimensions as the existing Figma thumbnail. Separately, `main.js`'s `renderPinned()` and `renderResources()` now filter out any artifact with `placeholder: true` before rendering, so the remaining `seed-04` through `seed-08` scaffold entries no longer show up on either page for visitors — they're still sitting in `ARTIFACTS` unedited, ready to be swapped for real content or deleted outright, same as before. Both pages were verified visually via a local static server + headless-browser screenshot after the edit.

**Same-day addendum — third page added: `about.html`, a personal bio for Dan.** Dan asked for the hub to mirror the About page from `dncreative.studio/about` (the DN Creative Studio marketing site — a separate project not in this repo), but shorter, more focused on him as a person than the company, with every Calendly/"Book a Coffee Talk" link removed, and the bottom "LET'S TALK" CTA section replaced with a row of large buttons out to DN Creative Studio, dannemirovsky.com, GitHub, and LinkedIn. **`dncreative.studio` and `dannemirovsky.com` both hit the same network egress block already logged above for figma.com** — confirmed again here (`WebFetch` → `EGRESS_BLOCKED`, direct `curl` CONNECT → 403), so the source page couldn't be fetched directly. `WebSearch` filled in the biographical facts (20+ years across finance/healthcare/tech/automotive, Prudential Financial and Northwell Health, the "Design Leader · AI Builder · Org Fixer" framing) well enough to draft the page, but Dan then supplied the actual source `about.html` file directly (upload) with the real bio copy, hobby-card content, and — critically — the correct outbound URLs (`github.com/Medhuvir` is the real GitHub, confirmed by Dan's own source rather than guessed; the assistant's account and Dan's personal GitHub are the same). **Don't guess a person's GitHub/LinkedIn/personal-site URLs for a public page** — this session paused and asked rather than publishing an unconfirmed link, which turned out to matter since a plausible-looking `github.com/dnemi` search hit was a different, unrelated person.

Content was deliberately cut down from the source page, not just reformatted: the source's third bio paragraph (pitching DN Creative Studio's enterprise-grade-thinking-without-the-overhead pitch) was dropped entirely — Dan's ask was "less about the company, more the person" — and the four-category "Tools & Skills" chip wall (Design / Tech & Dev / AI Stack / Strategy & Leadership, ~30 chips) was condensed to one row of 10 curated pills, keeping the craft- and AI-flavored ones (Figma, Claude, Gemini, Codex, Prompt Engineering) and dropping the agency-service-list ones (Salesforce, WordPress, Shopify, Webflow) that read as company-capability marketing rather than personal craft. The "Hobbies & Fun Facts" section was kept nearly intact (all 6 cards, lightly trimmed) since it's the most personal, least-company part of the source content and fits what Dan asked for. The source page's `dan-headshot.jpg` was **not** reproduced — this repo has no copy of that image file and none was fabricated; the bio section ships photo-less until Dan supplies the real headshot the way he supplied the Figma and toolkit thumbnails earlier (upload, wired into a straightforward `<img>` in the bio section — no `data.js` involvement, this page is static, not artifact-driven).

Styling reused this hub's own component system rather than importing anything from the source site's separate stylesheet (`dncreative.studio` runs its own CSS, not this repo's `style.css`/`hub.css`) — the hero/`.topo-bg` device, `.section`/`.section-head` pattern, `.pill` chips, and `.format-card` grid (reused for the hobby cards, unchanged from its original "How this hub works" use on Home) all carried over as-is. Two new CSS pieces were added to `style.css` since they're generic chrome: `.btn-row` (flex-wrap row for the bottom button group) and `.btn-cta--outline` (bordered/transparent variant of the existing `.btn-cta`) — needed because four solid-orange buttons side by side would break the brand rule of one orange focal point per screen (§6), so the DN Creative Studio link stays the one solid-orange `.btn-cta` and the other three (dannemirovsky.com, GitHub, LinkedIn) use the new outline variant. Nav (`.nav-links` + `.mobile-panel`) and footer (`.footer-links`) on `index.html` and `resources.html` were both updated to add the About link, so all three pages cross-link consistently. Verified via local static server + headless-Chromium screenshot at both desktop and mobile widths before pushing.

**Same-day addendum — the About page's bio photo was supplied.** Dan uploaded the real headshot directly; it's stored at `assets/img/dan-headshot.jpg` (474×512, the source file as supplied, unresized) and wired into `about.html`'s bio section, which was restructured from a single text column into a two-up `.bio-layout` grid (photo left ≤320px, bio text right) — new CSS in `style.css` (`.bio-layout`, `.bio-photo-wrap`, `.bio-photo`), following the same pattern as the small orange accent rule used elsewhere in the brand system. This page is static and isn't wired through `data.js` (no artifact card, no `thumbnail` field) — it's a plain `<img>` in the page markup, unlike every other image on this hub.

**Same-day addendum — an intake pipeline shipped: Notion inbox + weekly review Routine.** Dan wanted a way to drop links/files in from his phone without hand-editing `data.js`. He'd already built the capture point himself — a Notion page, **Design Hub Resource List** — before this was even proposed, so the pipeline was built around it rather than a new schema. Full mechanics are in the new §9 below. Two things worth flagging for whoever picks this up next: (1) `create_trigger`'s `connectors` parameter is disabled for this org ("not available for this organization") — the Routine below is self-bound to *this* persistent session specifically so it inherits the session's existing Notion access rather than needing a fresh grant, but that assumption was tested with a manual `fire_trigger` right after creation (see §9 for the result) rather than left to the first real Sunday run; (2) the Routine only ever drafts and reports — it never commits, pushes, or edits the Notion page on its own trigger, only after a human reply approves that run's batch.

---

## 9. Intake pipeline — Notion inbox + weekly review

**Capture point:** [Design Hub Resource List](https://app.notion.com/p/Design-Hub-Resource-List-3ba59c09d03a80c4abb2e85ddf2acc00) (Notion, under "D\|N Creative LLC"). A plain table, not a database — Dan built this himself. Columns:

| Column | Contains |
|---|---|
| Thumbnail (link) | An image URL or Notion file link, pasted as text |
| Details | Free-text summary + `#hashtags` for topic tags |
| Link | The destination URL |

Drop a row in from any device with Notion installed — that's the entire capture action. No status field to set, nothing else required.

**Weekly review:** a Routine (`DN Design Hub — Weekly Inbox Review`, Sunday 6pm ET / `0 22 * * 0` UTC, self-bound to this persistent session) wakes up, fetches the table, and diffs every row's `Link` against `ARTIFACTS[].url` in `assets/js/data.js` — anything not already present is new. For each new row it drafts a full artifact object (title/description via `WebFetch`, falling back to `WebSearch` for the egress-blocked domains already logged in §8: figma.com, dncreative.studio, dannemirovsky.com; `#hashtags` in Details mapped against the real 7-tag taxonomy in §4, flagging anything that doesn't match rather than inventing a tag; thumbnail carried over only if it's a real working image URL) and reports the batch back in-session for Dan to review. **Nothing is written, committed, or pushed until Dan approves that specific batch in a reply** — pinning is never inferred either, that's always Dan's explicit call. Once approved, the entries land in `data.js` per §3's normal edit pattern, get committed and pushed to the feature branch (main only if Dan says so, same as everything else in this repo), and the now-processed rows get deleted from the Notion table so it stays a live inbox rather than a growing log — the instructional example row and any still-unprocessed rows are left alone.

If a future session needs to adjust the cadence or wording, the trigger ID and `update_trigger`/`fire_trigger` tools handle that — no need to delete and recreate unless the whole approach changes.

**Same-day addendum — Home's pinned row refactored to a single full-width column, cap raised 4 → 5.** Dan asked for the "Top of mind" cards to stack full-width instead of the 4-up grid, with a 5th slot reserved but left empty until there's a real artifact for it. `index.html` dropped the `cols-4` class off `#pinned-grid` (now just `.artifact-grid.pinned-grid`); `main.js`'s `renderPinned()` cap moved from `.slice(0, 4)` to `.slice(0, 5)`. Card markup in `artifactCardHTML()` (`main.js`) now wraps everything after the thumbnail in a new `.ac-body` div — by default this is `display: contents` so it's invisible to the existing vertical card layout used everywhere else (Resources, and the pinned row below 780px), but `hub.css` uses it to switch pinned cards to a horizontal thumb-left/content-right layout at ≥780px (`.pinned-grid .artifact-card { flex-direction: row }`, thumb pinned to a fixed 320px column, `.ac-desc` capped at `70ch` so text doesn't run edge-to-edge on a full-width card). Only 4 of the 5 slots are populated right now — per Dan's instruction, the 5th stays empty (not a placeholder object, just an unfilled pin) until a real artifact is ready to take it; the grid already renders correctly at any count from 1–5, nothing further to build when that day comes. The stale "Four artifacts" copy in Home's Pinned section intro was reworded to "A handful of artifacts" so it doesn't need editing again when the 5th fills.

**This file, and `data.js`, should be updated together whenever the taxonomy changes or the page structure grows past two pages — don't let the narrative in this file drift from what the data actually shows.**
