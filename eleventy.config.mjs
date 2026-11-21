// DN Design Hub — Eleventy build
// Pre-renders every page so search engines and AI crawlers (most of which
// don't run JavaScript) see the actual resources. Content still lives in
// assets/js/data.js; src/_data/hub.js reads and validates it.
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { icon } = require("./lib/icons.js");
const schema = require("./lib/schema.js");
const site = require("./src/_data/site.js");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function (config) {
  // Published assets. data.js and the icon set are build inputs only.
  config.addPassthroughCopy("assets/css");
  config.addPassthroughCopy("assets/img");
  config.addPassthroughCopy("assets/fonts");
  config.addPassthroughCopy("assets/js/main.js");
  config.addPassthroughCopy("assets/js/topo-motion.js");
  config.addPassthroughCopy("assets/js/dn-ring-shader.js");
  config.addPassthroughCopy("assets/models");
  config.addPassthroughCopy("downloads/**/*.*");
  // Redirect stubs for pre-Nov 2026 URLs, copied as-is
  config.addPassthroughCopy("src/resources.html");
  config.addPassthroughCopy("src/about.html");

  // Root-relative path for anything in data.js ("assets/…", "downloads/…")
  config.addFilter("url", (p) => (/^https?:\/\//.test(p) ? p : "/" + String(p).replace(/^\//, "")));
  config.addFilter("absUrl", (p) => (/^https?:\/\//.test(p) ? p : site.url + "/" + String(p).replace(/^\//, "")));
  config.addFilter("host", (u) => (/^https?:\/\//.test(u) ? new URL(u).hostname.replace(/^www\./, "") : null));

  // "2026-08-11" → "Aug 11, 2026" / "Aug 2026" (no locale data needed)
  const parts = (iso) => iso.split("-").map(Number);
  config.addFilter("fmtDate", (iso) => { const [y, m, d] = parts(iso); return `${MONTHS[m - 1]} ${d}, ${y}`; });
  config.addFilter("monthYear", (iso) => { const [y, m] = parts(iso); return `${MONTHS[m - 1]} ${y}`; });
  config.addFilter("isoDateTime", (iso) => iso + "T00:00:00Z");

  // Meta description: whole words, about 155 characters
  config.addFilter("metaDesc", (s) => {
    if (s.length <= 158) return s;
    const cut = s.slice(0, 155);
    return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:\s—–-]+$/, "") + "…";
  });

  config.addFilter("icon", icon);
  config.addFilter("shortTitle", (t) => String(t).split(" — ")[0]);

  // JSON-LD: safe inside <script> ("<" escaped so "</script>" can't appear)
  config.addFilter("jsonld", (obj) => JSON.stringify(obj).replace(/</g, "\\u003c"));
  config.addFilter("schemaHome", (hub) => schema.home(hub, site));
  config.addFilter("schemaTopic", (t, hub) => schema.topic(t, hub, site));
  config.addFilter("schemaResource", (r, hub) => schema.resource(r, hub, site));

  // Text output (llms.txt, the feed): collapse whitespace
  config.addFilter("oneLine", (s) => String(s).replace(/\s+/g, " ").trim());

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    templateFormats: ["njk"],
    htmlTemplateEngine: "njk",
  };
}
