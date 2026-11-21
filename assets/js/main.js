/**
 * DN Design Hub — shared behavior
 * Nav (incl. hamburger), Home pinned render, Resources render + filter.
 * Depends on data.js being loaded first.
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

    var path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a, .mobile-panel a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) {
        a.classList.add("active");
      }
    });
  }

  /* ---------------- Footer ---------------- */
  function initFooterYear() {
    var el = document.getElementById("footer-year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------------- Helpers ---------------- */
  function fmtDate(iso) {
    var d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  // Each tag pill is a link to that topic's filtered view, so a card's topics
  // double as shareable entry points into the archive.
  function tagPillRow(tags) {
    return (
      '<div class="pill-row">' +
      tags.map(function (t) {
        var tag = TAGS[t];
        if (!tag) return "";
        return '<a class="pill" href="?tag=' + t + '#archive" data-tag="' + t + '" title="' + tag.desc + '">' + tag.label + "</a>";
      }).join("") +
      "</div>"
    );
  }

  function artifactCardHTML(a) {
    var tc = TYPE_COPY[a.type] || { icon: "", label: a.type };
    var placeholderBadge = a.placeholder
      ? '<span class="badge badge-placeholder" title="Scaffold content — replace in data.js">Placeholder</span>'
      : "";
    var thumb = a.thumbnail
      ? '<div class="ac-thumb"><img src="' + a.thumbnail + '" alt="" loading="lazy"></div>'
      : "";
    var isDownload = a.type === "download";
    var ctaLabel = isDownload ? "Download" : "Open";
    var ctaAttrs = isDownload ? ' download rel="noopener"' : ' target="_blank" rel="noopener"';
    var arrow = isDownload
      ? '<span class="ac-arrow ac-arrow--down" aria-hidden="true">&darr;</span>'
      : '<span class="ac-arrow ac-arrow--out" aria-hidden="true">&nearr;</span>';
    return (
      '<article class="artifact-card reveal" data-type="' + a.type + '" data-tags="' + a.tags.join(",") + '" data-id="' + a.id + '">' +
        thumb +
        '<div class="ac-body">' +
          '<div class="ac-top">' +
            '<span class="ac-type">' + DN_ICON(tc.icon) + tc.label + "</span>" +
            placeholderBadge +
          "</div>" +
          '<h3 class="ac-title">' + a.title + "</h3>" +
          (a.source ? '<div class="ac-source">' + a.source + "</div>" : "") +
          '<p class="ac-desc">' + a.description + "</p>" +
          tagPillRow(a.tags) +
          '<div class="ac-foot">' +
            '<span class="ac-date">Added ' + fmtDate(a.dateAdded) + "</span>" +
            '<a class="ac-link" href="' + a.url + '"' + ctaAttrs + ">" + ctaLabel + " " + arrow +
              '<span class="sr-only">: ' + a.title + (isDownload ? "" : " (opens in a new tab)") + "</span></a>" +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  /* ---------------- Home: pinned render ---------------- */
  function renderPinned() {
    var grid = document.getElementById("pinned-grid");
    if (!grid) return;

    // Home's pinned order follows ARTIFACTS array order, not dateAdded — so
    // reordering the pinned row on Home is just reordering objects in
    // data.js. Capped to 5 as a safety net if more than 5 get marked pinned.
    var visible = ARTIFACTS.filter(function (a) { return !a.placeholder; });
    var pinned = visible.filter(function (a) { return a.pinned; }).slice(0, 5);

    grid.innerHTML = pinned.map(artifactCardHTML).join("");

    var totalEl = document.getElementById("total-count");
    if (totalEl) totalEl.textContent = visible.length;
    var tagEl = document.getElementById("tag-count");
    if (tagEl) tagEl.textContent = usedTags().length;
    // Computed from the data so it never goes stale
    var lastEl = document.getElementById("last-added");
    if (lastEl && visible.length) {
      var latest = visible.map(function (a) { return a.dateAdded; }).sort().pop();
      lastEl.textContent = new Date(latest + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }
  }

  /* ---------------- Resources: full archive render + filters ---------------- */
  var activeFilters = { tag: "all", type: "all" };

  // Topics that at least one visible resource carries. Empty topics stay
  // defined in data.js but don't show as filters or count as topics.
  function usedTags() {
    var used = {};
    ARTIFACTS.forEach(function (a) { if (!a.placeholder) a.tags.forEach(function (t) { used[t] = true; }); });
    return Object.keys(TAGS).filter(function (k) { return used[k]; });
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
    var params = new URLSearchParams(window.location.search);
    var tag = params.get("tag"), type = params.get("type");
    if (tag === "video" && !TAGS.video) { tag = null; type = type || "video"; }
    if (tag && LEGACY_TAGS[tag]) tag = LEGACY_TAGS[tag];
    activeFilters.tag = tag && usedTags().indexOf(tag) !== -1 ? tag : "all";
    activeFilters.type = type && TYPE_COPY[type] ? type : "all";
  }

  function writeFiltersToURL() {
    var params = new URLSearchParams();
    if (activeFilters.tag !== "all") params.set("tag", activeFilters.tag);
    if (activeFilters.type !== "all") params.set("type", activeFilters.type);
    var qs = params.toString();
    history.replaceState(null, "", window.location.pathname + (qs ? "?" + qs + "#archive" : ""));
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
      card.style.display = show ? "" : "none";
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
    document.querySelectorAll("[data-filter-tag]").forEach(function (chip) {
      chip.addEventListener("click", function () { setFilters({ tag: chip.getAttribute("data-filter-tag") }); });
    });
    document.querySelectorAll("[data-filter-type]").forEach(function (chip) {
      chip.addEventListener("click", function () { setFilters({ type: chip.getAttribute("data-filter-type") }); });
    });
    var clear = document.getElementById("clear-filters");
    if (clear) clear.addEventListener("click", function () { setFilters({ tag: "all", type: "all" }); });

    // Any card's tag pill (featured or archive) filters the archive in place
    document.addEventListener("click", function (e) {
      var pill = e.target.closest("a.pill[data-tag]");
      if (!pill) return;
      e.preventDefault();
      setFilters({ tag: pill.getAttribute("data-tag") });
      var archive = document.getElementById("archive");
      if (archive) archive.scrollIntoView({ block: "start" });
    });
  }

  function buildTagFilterChips() {
    var wrap = document.getElementById("tag-filter-group");
    if (!wrap) return;
    var chips = ['<button class="chip is-active" type="button" data-filter-tag="all">All</button>'];
    usedTags().forEach(function (key) {
      chips.push('<button class="chip" type="button" data-filter-tag="' + key + '">' + TAGS[key].label + "</button>");
    });
    wrap.innerHTML = chips.join("");
  }

  function renderResources() {
    var list = document.getElementById("resources-grid");
    if (!list) return;

    buildTagFilterChips();

    var all = ARTIFACTS.filter(function (a) { return !a.placeholder; }).sort(function (a, b) {
      return new Date(b.dateAdded) - new Date(a.dateAdded);
    });

    list.innerHTML = all.map(artifactCardHTML).join("");

    var totalEl = document.getElementById("resources-total");
    if (totalEl) totalEl.textContent = all.length;

    readFiltersFromURL();
    writeFiltersToURL();   // normalise: drops unknown values from the address bar
    syncChips();
    initFilters();
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

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initFooterYear();
    renderPinned();
    renderResources();
    initReveal();
    // The browser jumps to #hash before the cards above it render; jump again
    // now that the page has its real height.
    var target = window.location.hash && document.getElementById(window.location.hash.slice(1));
    if (target) target.scrollIntoView({ block: "start" });
  });
})();
