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
    thumbnail: "assets/img/thumbs/ux-skills-toolkit.png",
  },
  {
    id: "figma-claude-skills-for-design",
    title: "10 Claude Skills for Design To Improve Workflows",
    description: "Figma's official resource-library roundup of 10 Claude Skills built for design work — reusable instruction sets Claude carries into every conversation to stay consistent with a team's design system. Covers Figma-built skills (e.g. /figma-generate-design, which builds from an approved component library) alongside community favorites like /audit-design-system and /contrast-auditor for WCAG contrast scoring.",
    url: "https://www.figma.com/resource-library/claude-skills-for-design/",
    type: "link",
    tags: ["design"],
    pinned: true,
    dateAdded: "2026-08-11",
    source: "Figma",
    thumbnail: "assets/img/thumbs/figma-claude-skills-for-design.png",
  },
  {
    id: "awesome-ux-skills",
    title: "Awesome UX Skills — 30+ Claude Skills for UX & AI Product Design",
    description: "A GitHub collection of 30+ Claude Code skills spanning UX Research & Strategy (personas, empathy/journey mapping, double-diamond), UI Analysis & Improvement (heuristics, accessibility, cognitive load, persuasive UX), and AI Product Design (governors, identifiers, inputs, trust-builders, tuning). Clone the repo and run install.sh to drop the skills into ~/.claude/skills/, or invoke them by name.",
    url: "https://github.com/tommyjepsen/awesome-ux-skills",
    type: "link",
    tags: ["skills-agents", "ux", "research"],
    pinned: true,
    dateAdded: "2026-08-12",
    source: "Tommy Jepsen",
    thumbnail: "assets/img/thumbs/awesome-ux-skills.png",
  },
  {
    id: "ui-ux-pro-max-skill",
    title: "UI/UX Pro Max — Claude Skill for Design Systems & Frontend Implementation",
    description: "A single, dense Claude skill (SKILL.md) that works as a searchable design-intelligence database — 84 design styles, 192 color palettes, 74 font pairings, 98 UX guidelines, 104 icon entries, 16 GSAP animation presets, and 25 chart-type recommendations — plus implementation guidance across 22 frameworks (React, Next.js, Vue, Svelte, Flutter, SwiftUI, Tailwind, shadcn/ui, and more). Four-step workflow: analyze requirements, generate a design system, deep-dive searches as needed, then apply stack-specific guidelines.",
    url: "https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/.claude/skills/ui-ux-pro-max/SKILL.md",
    type: "link",
    tags: ["skills-agents", "design", "engineering"],
    pinned: true,
    dateAdded: "2026-08-12",
    source: "nextlevelbuilder",
    thumbnail: "assets/img/thumbs/ui-ux-pro-max-skill.png",
  },
  {
    id: "anatomy-of-agentic-system",
    title: "The Anatomy of an Agentic System",
    description: "Matthew Kruczek's Context Engineering essay on what actually turns a raw LLM into a working agent — the harness layers (agent loop, tool definitions, context management) plus the rules, hooks, skills, and memory that compose into a deterministic layer scaling automation beyond the model itself. Part of his ongoing series on agentic and multi-agent system architecture.",
    url: "https://matthewkruczek.substack.com/p/the-anatomy-of-an-agentic-system",
    type: "explainer",
    tags: ["skills-agents", "engineering"],
    pinned: true,
    dateAdded: "2026-08-12",
    source: "Matthew Kruczek",
    thumbnail: "assets/img/thumbs/anatomy-of-agentic-system.png",
  },
  {
    id: "seed-04",
    title: "[Placeholder] A file worth keeping local",
    description: "type: \"download\" — templates, PDFs, kits, anything meant to be grabbed rather than browsed. Point url at the actual file (this repo's /downloads folder, or an external host). Unpinned now that the toolkit and the Figma link fill the download/link pinned slots — demoted rather than deleted, still a valid example.",
    url: "#",
    type: "download",
    tags: ["design"],
    pinned: false,
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
