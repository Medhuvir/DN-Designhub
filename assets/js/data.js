/**
 * DN Design Hub — data source
 * ================================================
 * This file is the single source of truth for every artifact shown on
 * Home (pinned) and Resources (full archive). Edit this file to add,
 * update, or re-tag artifacts — the pages re-render from it, don't
 * hand-edit the HTML.
 *
 * HOW TO ADD A NEW ARTIFACT
 * -------------------------
 * Copy an existing object in ARTIFACTS, give it a new unique `id`, and
 * fill in the fields:
 *   - type: exactly one of "link" | "download" | "explainer" | "video"
 *     (the format of the thing itself — see TYPE_COPY below)
 *   - tags: array of one or more keys from TAGS below (the topic).
 *     An artifact can carry more than one tag.
 *   - pinned: true surfaces it in the Home page's "Pinned" row. Keep
 *     this at exactly 4 pinned artifacts at a time — Home is designed
 *     around a 4-up grid, not a scrolling list. Promote one, demote
 *     another rather than letting the count drift.
 *   - dateAdded: "YYYY-MM-DD", used for the "Recently added" sort on
 *     Resources.
 *
 * HOW TO ADD A NEW TAG
 * ---------------------
 * Add a key to TAGS with a `label` and one-line `desc`. The taxonomy
 * below is a v1 starting point, not locked — see CLAUDE.md §3 for the
 * discipline on growing it (merge before you multiply; a tag needs 2+
 * artifacts to justify existing as its own filter).
 *
 * See /CLAUDE.md at the project root for full context on what this hub
 * is for and how it's meant to be kept current.
 */

const TYPE_COPY = {
  link:      { icon: "🔗", label: "Link" },
  download:  { icon: "⬇️", label: "Download" },
  explainer: { icon: "📄", label: "Explainer" },
  video:     { icon: "🎬", label: "Video" },
};

const TAGS = {
  "ai-workflows":   { label: "AI & Agent Workflows", desc: "Tools, prompting patterns, and agent setups worth reusing." },
  "design-systems": { label: "Design Systems & UI",  desc: "Component libraries, token systems, and UI craft references." },
  "branding":       { label: "Branding & Identity",  desc: "Identity systems, logo/type/color decisions, brand strategy." },
  "ux-research":    { label: "UX Research & Strategy", desc: "Research methods, behavioral principles, product-strategy reads." },
  "frameworks":     { label: "Frameworks & Methods", desc: "Named processes and mental models for running design work." },
  "business":       { label: "Freelance & Business", desc: "Pricing, contracts, positioning, and running a design practice." },
  "inspiration":    { label: "Inspiration & Reference", desc: "Portfolio and visual reference — things worth looking at, not necessarily using." },
  "tools":          { label: "Tools & Software",     desc: "Software worth having in the kit." },
};

const ARTIFACTS = [
  {
    id: "seed-01",
    title: "[Placeholder] Swap me for your first pinned artifact",
    description: "This card is one of the 4 pinned to Home. Edit this object in data.js — set a real title, description, url, type, and tags, and it replaces this placeholder.",
    url: "#",
    type: "link",
    tags: ["ai-workflows", "tools"],
    pinned: true,
    dateAdded: "2026-08-11",
    source: "",
    placeholder: true,
  },
  {
    id: "seed-02",
    title: "[Placeholder] A framework or explainer worth citing",
    description: "type: \"explainer\" is for write-ups and reference reading rather than a tool you'd click into and use — think Laws of UX-style pages, methodology explainers, deep-dive articles.",
    url: "#",
    type: "explainer",
    tags: ["frameworks", "ux-research"],
    pinned: true,
    dateAdded: "2026-08-11",
    source: "",
    placeholder: true,
  },
  {
    id: "seed-03",
    title: "[Placeholder] A talk, walkthrough, or demo reel",
    description: "type: \"video\" — conference talks, product demos, process breakdowns. Link straight to the video, not a landing page around it.",
    url: "#",
    type: "video",
    tags: ["inspiration"],
    pinned: true,
    dateAdded: "2026-08-11",
    source: "",
    placeholder: true,
  },
  {
    id: "seed-04",
    title: "[Placeholder] A file worth keeping local",
    description: "type: \"download\" — templates, PDFs, kits, anything meant to be grabbed rather than browsed. Point url at the actual file (this repo's /downloads folder, or an external host).",
    url: "#",
    type: "download",
    tags: ["business"],
    pinned: true,
    dateAdded: "2026-08-11",
    source: "",
    placeholder: true,
  },
  {
    id: "seed-05",
    title: "[Placeholder] Unpinned example — Design Systems",
    description: "Not every artifact needs to be pinned. This one shows up on Resources under Design Systems & UI but not on Home — set pinned:false (or omit it) for anything that isn't top-of-mind right now.",
    url: "#",
    type: "link",
    tags: ["design-systems"],
    pinned: false,
    dateAdded: "2026-08-10",
    source: "",
    placeholder: true,
  },
  {
    id: "seed-06",
    title: "[Placeholder] Unpinned example — Branding",
    description: "An artifact can carry more than one tag — this one could just as easily also carry \"inspiration\" if it's more mood-board than method.",
    url: "#",
    type: "link",
    tags: ["branding"],
    pinned: false,
    dateAdded: "2026-08-09",
    source: "",
    placeholder: true,
  },
  {
    id: "seed-07",
    title: "[Placeholder] Unpinned example — Business",
    description: "Contracts, pricing calculators, positioning frameworks — the operating side of running DN Creative, not the craft side.",
    url: "#",
    type: "explainer",
    tags: ["business", "frameworks"],
    pinned: false,
    dateAdded: "2026-08-08",
    source: "",
    placeholder: true,
  },
  {
    id: "seed-08",
    title: "[Placeholder] Unpinned example — AI Workflows",
    description: "Once real artifacts replace these, delete the placeholder:true flag (or the whole object) — it's only here so the empty state never ships to a visitor.",
    url: "#",
    type: "link",
    tags: ["ai-workflows"],
    pinned: false,
    dateAdded: "2026-08-07",
    source: "",
    placeholder: true,
  },
];
