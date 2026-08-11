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
 *   - thumbnail: optional. A URL or local path (e.g. `assets/img/...`) to
 *     a 16:9 image shown at the top of the card. Omit the field entirely
 *     if there's no image yet — the card layout doesn't require one.
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
  "design":        { label: "Design", desc: "Visual craft, design systems, and branding/identity — branding lives here, not as its own tag." },
  "engineering":   { label: "Engineering", desc: "Dev/technical resources — code, tooling, technical implementation." },
  "ux":            { label: "UX", desc: "Interaction design, product experience, and UX craft." },
  "research":      { label: "Research", desc: "Research methods and findings — user research, market/competitive reads." },
  "skills-agents": { label: "Skills & Agents", desc: "Claude skills, agent workflows, and AI tooling worth reusing." },
  "video":         { label: "Video", desc: "Talks, demos, and walkthroughs worth watching. Deliberately overlaps with the Video *format* — an artifact can be type:\"video\" and tagged Video at once, that's fine." },
  "inspiration":   { label: "Inspiration + Cool Shit", desc: "Things worth looking at just because they're great — no further justification needed." },
};

const ARTIFACTS = [
  {
    id: "ux-skills-toolkit",
    title: "UX / AI Workflow Skill Toolkit",
    description: "11 Claude skills for UX, product, and service design practice, organized along the Double Diamond — research-method selection, persona synthesis, cognitive-load/conversion audits, persuasive-ux, plus a full AI-feature set (tuners, inputs, governors, trust-builders, identifiers). Built for scoping, auditing, and assessing work across the UX/service-design workflow.",
    url: "downloads/ux-skills-toolkit.zip",
    type: "download",
    tags: ["skills-agents", "ux", "research"],
    pinned: true,
    dateAdded: "2026-08-11",
    source: "Dan Nemirovsky",
  },
  {
    id: "figma-claude-skills-for-design",
    title: "10 Claude Skills for Design To Improve Workflows",
    description: "Figma's official resource-library roundup of 10 Claude Skills built for design work — reusable instruction sets Claude carries into every conversation to stay consistent with a team's design system. Covers Figma-built skills (e.g. /figma-generate-design, which builds from an approved component library) alongside community favorites like /audit-design-system and /contrast-auditor for WCAG contrast scoring.",
    url: "https://www.figma.com/resource-library/claude-skills-for-design/",
    type: "link",
    tags: ["design"],
    pinned: false,
    dateAdded: "2026-08-11",
    source: "Figma",
    // No thumbnail: figma.com is unreachable from this environment's network
    // policy (confirmed via curl, WebFetch, and headless Chromium — all
    // blocked at the egress proxy), so the og:image couldn't be pulled
    // automatically. Add a `thumbnail` field once a real image is supplied.
  },
  {
    id: "seed-02",
    title: "[Placeholder] A framework or explainer worth citing",
    description: "type: \"explainer\" is for write-ups and reference reading rather than a tool you'd click into and use — think Laws of UX-style pages, methodology explainers, deep-dive articles.",
    url: "#",
    type: "explainer",
    tags: ["ux", "research"],
    pinned: true,
    dateAdded: "2026-08-11",
    source: "",
    placeholder: true,
  },
  {
    id: "seed-03",
    title: "[Placeholder] A talk, walkthrough, or demo reel",
    description: "type: \"video\" — conference talks, product demos, process breakdowns. Link straight to the video, not a landing page around it. Tagged \"video\" here too, on top of the video format — that overlap is intentional, not a bug.",
    url: "#",
    type: "video",
    tags: ["video", "inspiration"],
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
    tags: ["design"],
    pinned: true,
    dateAdded: "2026-08-11",
    source: "",
    placeholder: true,
  },
  {
    id: "seed-05",
    title: "[Placeholder] Unpinned example — Design",
    description: "Not every artifact needs to be pinned. This one shows up on Resources under Design but not on Home — set pinned:false (or omit it) for anything that isn't top-of-mind right now.",
    url: "#",
    type: "link",
    tags: ["design"],
    pinned: false,
    dateAdded: "2026-08-10",
    source: "",
    placeholder: true,
  },
  {
    id: "seed-06",
    title: "[Placeholder] Unpinned example — Branding (folds into Design)",
    description: "Branding/identity content doesn't get its own tag — it's Design. This slot exists specifically to keep that decision from getting silently reversed later.",
    url: "#",
    type: "link",
    tags: ["design"],
    pinned: false,
    dateAdded: "2026-08-09",
    source: "",
    placeholder: true,
  },
  {
    id: "seed-07",
    title: "[Placeholder] Unpinned example — Engineering",
    description: "Dev/technical resources — code references, tooling, technical implementation notes. The one tag with no craft or research angle, purely build-it material.",
    url: "#",
    type: "explainer",
    tags: ["engineering"],
    pinned: false,
    dateAdded: "2026-08-08",
    source: "",
    placeholder: true,
  },
  {
    id: "seed-08",
    title: "[Placeholder] Unpinned example — Skills & Agents",
    description: "Once real artifacts replace these, delete the placeholder:true flag (or the whole object) — it's only here so the empty state never ships to a visitor.",
    url: "#",
    type: "link",
    tags: ["skills-agents"],
    pinned: false,
    dateAdded: "2026-08-07",
    source: "",
    placeholder: true,
  },
];
