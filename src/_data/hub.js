// Loads assets/js/data.js (still the single source of truth for content)
// and shapes it for the templates. The build fails loudly on bad data, so a
// typo in a tag or a duplicate id never ships as a broken page.
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { icon, names: ICONS } = require("../../lib/icons.js");

const file = path.join(__dirname, "../../assets/js/data.js");
const { TYPE_COPY, TAGS, ARTIFACTS } = vm.runInNewContext(
  fs.readFileSync(file, "utf8") + "\n;({ TYPE_COPY, TAGS, ARTIFACTS })",
  {},
  { filename: file }
);

// ---- Validate ------------------------------------------------------------
const errors = [];
const seen = new Set();
ARTIFACTS.forEach((a, i) => {
  const where = `ARTIFACTS[${i}] (${a.id || "no id"})`;
  if (!a.id || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(a.id)) errors.push(`${where}: id must be lowercase-kebab-case (it becomes the /r/<id>/ URL)`);
  if (seen.has(a.id)) errors.push(`${where}: duplicate id`);
  seen.add(a.id);
  if (!TYPE_COPY[a.type]) errors.push(`${where}: unknown type "${a.type}"`);
  if (!Array.isArray(a.tags) || !a.tags.length) errors.push(`${where}: needs at least one tag`);
  else a.tags.forEach((t) => { if (!TAGS[t]) errors.push(`${where}: unknown tag "${t}"`); });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(a.dateAdded || "")) errors.push(`${where}: dateAdded must be YYYY-MM-DD`);
  ["title", "description", "url"].forEach((k) => { if (!a[k]) errors.push(`${where}: missing ${k}`); });
});
Object.keys(TAGS).forEach((k) => {
  if (TAGS[k].icon && !ICONS.includes(TAGS[k].icon)) errors.push(`TAGS["${k}"]: unknown icon "${TAGS[k].icon}" (see lib/icons.js)`);
});
if (errors.length) throw new Error("assets/js/data.js has problems:\n  " + errors.join("\n  "));

// ---- Shape ---------------------------------------------------------------
const visible = ARTIFACTS.filter((a) => !a.placeholder);
// Newest first; same-day entries keep their data.js order (sort is stable)
const resources = [...visible].sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
// Featured order is data.js array order, capped at 5 (CLAUDE.md §3)
const pinned = visible.filter((a) => a.pinned).slice(0, 5);

// Topics with at least one resource; empty ones stay defined but hidden
const topics = Object.keys(TAGS)
  .filter((key) => visible.some((a) => a.tags.includes(key)))
  .map((key) => {
    const items = resources.filter((a) => a.tags.includes(key));
    return { key, label: TAGS[key].label, desc: TAGS[key].desc, resources: items, latest: items[0].dateAdded };
  });

// Share cards (1200x630) made by `node tools/thumbnails/render.js --og`.
// A resource without one shares its thumbnail; a topic, the hub's card.
const ROOT = path.join(__dirname, "../..");
const card = (rel) => (fs.existsSync(path.join(ROOT, rel)) ? "/" + rel : null);
const missing = [];
resources.forEach((r) => { r.og = card(`assets/img/og/r/${r.id}.jpg`); if (!r.og) { missing.push("r/" + r.id); r.og = r.thumbnail || null; } });
topics.forEach((t) => { t.og = card(`assets/img/og/t/${t.key}.jpg`); if (!t.og) missing.push("t/" + t.key); });
if (missing.length) console.warn(`[hub] no share card yet for ${missing.join(", ")}: run node tools/thumbnails/render.js --og`);

// "More like this": most shared topics first, then newest, up to 4
resources.forEach((r) => {
  r.related = resources
    .filter((o) => o.id !== r.id)
    .map((o) => ({ o, shared: o.tags.filter((t) => r.tags.includes(t)).length }))
    .filter((x) => x.shared > 0)
    .sort((x, y) => y.shared - x.shared || y.o.dateAdded.localeCompare(x.o.dateAdded))
    .slice(0, 4)
    .map((x) => x.o);
});

// Inlined on every page for the nav search (no fetch, no server). Icons ride
// along so results can show each topic's mark.
const short = (t) => t.split(" — ")[0];
const searchIndex = {
  types: Object.fromEntries(Object.entries(TYPE_COPY).map(([k, t]) => [k, { label: t.label, icon: icon(t.icon) }])),
  topics: topics.map((t) => ({ key: t.key, label: t.label, n: t.resources.length, icon: icon(TAGS[t.key].icon || "tag") })),
  resources: resources.map((r) => ({
    id: r.id, title: r.title, short: short(r.title), type: r.type, tags: r.tags,
    source: r.source || "", text: [r.description, r.source, r.tags.map((t) => TAGS[t].label).join(" "), TYPE_COPY[r.type].label].join(" "),
  })),
};

module.exports = {
  types: TYPE_COPY,
  tags: TAGS,
  resources,
  pinned,
  topics,
  latest: resources.length ? resources[0].dateAdded : null,
  searchIndex,
};
