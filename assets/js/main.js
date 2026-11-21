/**
 * DN Design Hub — shared behavior
 * Nav (incl. hamburger), archive filters, scroll reveal.
 * Every page is pre-rendered by Eleventy; nothing here builds content.
 */

(function () {
  "use strict";

  /* ---------------- Nav ---------------- */
  function initNav() {
    var burger = document.querySelector(".hamburger");
    var panel = document.querySelector(".mobile-panel");
    if (burger && panel) {
      var setOpen = function (open, returnFocus) {
        burger.classList.toggle("is-open", open);
        panel.classList.toggle("is-open", open);
        burger.setAttribute("aria-expanded", open);
        document.body.style.overflow = open ? "hidden" : "";
        if (open) { var first = panel.querySelector("a"); if (first) first.focus(); }
        else if (returnFocus) burger.focus();
      };
      burger.addEventListener("click", function () { setOpen(!panel.classList.contains("is-open")); });
      panel.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () { setOpen(false); });
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && panel.classList.contains("is-open")) setOpen(false, true);
      });
    }
  }

  /* ---------------- Footer ---------------- */
  function initFooterYear() {
    var el = document.getElementById("footer-year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------------- Archive filters ----------------
     Every card is in the HTML already (pre-rendered at build time from
     assets/js/data.js), so this only shows and hides them. Valid filter
     values are read off the chips, so nothing here repeats the data. */
  var activeFilters = { tag: "all", type: "all" };

  function chipValues(attr) {
    return [].map.call(document.querySelectorAll("[" + attr + "]"), function (c) {
      return c.getAttribute(attr);
    }).filter(function (v) { return v !== "all"; });
  }

  // Links shared before the Nov 2026 topic refresh used the old tag keys.
  // Map them to their closest new topic (old "video" tag -> the Video format).
  var LEGACY_TAGS = {
    "skills-agents": "claude-skills", "ux": "ux-research", "research": "ux-research",
    "design": "design-systems", "engineering": "agent-architecture",
  };

  // Filter state lives in the URL (?tag=…&type=…) so any filtered view can be
  // shared as a link. Unknown values fall back to "all".
  function readFiltersFromURL() {
    var tags = chipValues("data-filter-tag"), types = chipValues("data-filter-type");
    var params = new URLSearchParams(window.location.search);
    var tag = params.get("tag"), type = params.get("type");
    if (tag === "video" && tags.indexOf("video") === -1) { tag = null; type = type || "video"; }
    if (tag && LEGACY_TAGS[tag]) tag = LEGACY_TAGS[tag];
    activeFilters.tag = tag && tags.indexOf(tag) !== -1 ? tag : "all";
    activeFilters.type = type && types.indexOf(type) !== -1 ? type : "all";
  }

  function writeFiltersToURL() {
    var params = new URLSearchParams();
    if (activeFilters.tag !== "all") params.set("tag", activeFilters.tag);
    if (activeFilters.type !== "all") params.set("type", activeFilters.type);
    var qs = params.toString();
    // With filters active the URL lands on the archive; without, keep whatever
    // anchor the visitor arrived on (#about, #featured…) rather than dropping it
    history.replaceState(null, "", window.location.pathname + (qs ? "?" + qs + "#archive" : window.location.hash));
  }

  function syncChips() {
    document.querySelectorAll("[data-filter-tag]").forEach(function (c) {
      var on = c.getAttribute("data-filter-tag") === activeFilters.tag;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", on);
    });
    document.querySelectorAll("[data-filter-type]").forEach(function (c) {
      var on = c.getAttribute("data-filter-type") === activeFilters.type;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", on);
    });
  }

  function setFilters(next) {
    if (next.tag) activeFilters.tag = next.tag;
    if (next.type) activeFilters.type = next.type;
    syncChips();
    applyFilters();
    writeFiltersToURL();
  }

  function applyFilters() {
    var cards = document.querySelectorAll("#resources-grid .artifact-card");
    var visibleCount = 0;
    cards.forEach(function (card) {
      var type = card.getAttribute("data-type");
      var tags = card.getAttribute("data-tags").split(",");
      var passType = activeFilters.type === "all" || activeFilters.type === type;
      var passTag = activeFilters.tag === "all" || tags.indexOf(activeFilters.tag) !== -1;
      var show = passType && passTag;
      card.hidden = !show;
      if (show) visibleCount++;
    });
    var resultsEl = document.getElementById("results-count");
    if (resultsEl) resultsEl.textContent = visibleCount;
    // Announced to screen readers (role="status") when the filter changes
    var statusEl = document.getElementById("results-status");
    if (statusEl) statusEl.textContent = "Showing " + visibleCount + " of " + cards.length + " resources";
    if (revealCheck) revealCheck();   // cards a filter just un-hid may already be in view
    var emptyEl = document.getElementById("resources-empty");
    if (emptyEl) emptyEl.hidden = visibleCount !== 0;
  }

  function initFilters() {
    var archive = document.getElementById("archive");
    if (!document.getElementById("resources-grid")) return;   // only the home page has the archive

    document.querySelectorAll("[data-filter-tag]").forEach(function (chip) {
      chip.addEventListener("click", function () { setFilters({ tag: chip.getAttribute("data-filter-tag") }); });
    });
    document.querySelectorAll("[data-filter-type]").forEach(function (chip) {
      chip.addEventListener("click", function () { setFilters({ type: chip.getAttribute("data-filter-type") }); });
    });
    var clear = document.getElementById("clear-filters");
    if (clear) clear.addEventListener("click", function () { setFilters({ tag: "all", type: "all" }); });

    // A card's topic pill links to that topic's page; on the home page it
    // filters the archive in place instead (new-tab clicks still open the page)
    document.addEventListener("click", function (e) {
      var pill = e.target.closest("a.pill[data-tag]");
      if (!pill || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      setFilters({ tag: pill.getAttribute("data-tag") });
      if (archive) archive.scrollIntoView({ block: "start" });
    });

    readFiltersFromURL();
    writeFiltersToURL();   // normalise: drops unknown values from the address bar
    syncChips();
    applyFilters();
  }

  /* ---------------- Motion: scroll reveal ----------------
     Grouped content fades up as it enters the viewport. Each batch that
     enters together is staggered with the brand's .d1–.d6 steps, so items
     never all animate at once. Reduced motion: everything shows at once. */
  // Geometry check on scroll rather than IntersectionObserver: an observer
  // never fires for items a fast scroll or a jump skips over entirely, which
  // left them invisible. Here anything at or above the reveal line is shown;
  // items that went past unseen appear immediately rather than animating late.
  var revealCheck = null;

  function initReveal() {
    var items = [].slice.call(document.querySelectorAll(".artifact-card, .format-card"));
    items.forEach(function (el) { el.classList.add("reveal"); });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var pending = items, queued = false;
    function check() {
      queued = false;
      var line = window.innerHeight * 0.92, step = 0;
      pending = pending.filter(function (el) {
        if (!el.offsetParent) return true;                 // filtered out (display: none): check later
        var r = el.getBoundingClientRect();
        if (r.top >= line) return true;                    // still below the reveal line
        if (r.bottom <= 0) el.classList.add("is-visible", "no-anim");   // skipped past unseen
        else el.classList.add("is-visible", "d" + Math.min(++step, 6)); // staggered in DOM order
        return false;
      });
      if (!pending.length) {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
      }
    }
    function schedule() { if (!queued) { queued = true; requestAnimationFrame(check); } }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    revealCheck = schedule;
    check();
  }

  // Filtering on load can change the page height after the browser has
  // already jumped to #hash, so jump again once things settle.
  // Instant, not smooth: a smooth scroll here races the browser's own
  // load-time fragment scroll and overshoots (measured: 127px).
  function alignToHash() {
    var target = window.location.hash && document.getElementById(window.location.hash.slice(1));
    if (target) target.scrollIntoView({ block: "start", behavior: "instant" });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initFooterYear();
    initFilters();
    initReveal();
    alignToHash();
    // Images can still shift things before load; re-align then too, unless the
    // visitor has already started scrolling on their own.
    var touched = false;
    ["wheel", "touchstart", "keydown", "pointerdown"].forEach(function (ev) {
      window.addEventListener(ev, function () { touched = true; }, { once: true, passive: true });
    });
    window.addEventListener("load", function () { if (!touched) alignToHash(); });
  });
})();
