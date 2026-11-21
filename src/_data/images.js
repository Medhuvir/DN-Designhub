// Responsive thumbnails, made at build time with @11ty/eleventy-img:
// WebP + JPEG at 400 / 800 / 1200px wide (never upscaled), with the real
// width/height so the browser reserves the space before the image loads.
// Files land in _site/assets/img/r/<id>-<hash>-<width>.<format>; the hash
// changes when the source does, so they can be cached for a year.
// Remote thumbnails are fetched and cached (.cache/); if one can't be
// fetched the card falls back to the original URL rather than failing.
"use strict";
const path = require("path");
const Image = require("@11ty/eleventy-img");
const hub = require("./hub.js");

const ROOT = path.join(__dirname, "../..");

module.exports = async function () {
  const out = {};
  for (const r of hub.resources) {
    if (!r.thumbnail) continue;
    const src = /^https?:\/\//.test(r.thumbnail) ? r.thumbnail : path.join(ROOT, r.thumbnail);
    try {
      const meta = await Image(src, {
        widths: [400, 800, 1200],
        formats: ["webp", "jpeg"],
        outputDir: path.join(ROOT, "_site/assets/img/r"),
        urlPath: "/assets/img/r/",
        filenameFormat: (hash, _src, width, format) => `${r.id}-${hash}-${width}.${format}`,
        sharpWebpOptions: { quality: 78 },
        sharpJpegOptions: { quality: 80, mozjpeg: true },
        cacheOptions: { duration: "4w", directory: path.join(ROOT, ".cache") },
      });
      const largest = meta.jpeg[meta.jpeg.length - 1];
      out[r.id] = {
        webp: meta.webp.map((m) => m.srcset).join(", "),
        jpeg: meta.jpeg.map((m) => m.srcset).join(", "),
        src: (meta.jpeg.find((m) => m.width >= 800) || largest).url,
        width: largest.width,
        height: largest.height,
      };
    } catch (e) {
      console.warn(`[images] ${r.id}: ${e.message.split("\n")[0]} (using the original image)`);
    }
  }
  return out;
};
