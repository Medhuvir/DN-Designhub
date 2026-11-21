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
      burger.addEventListener("click", function () {
        var open = burger.classList.toggle("is-open");
        panel.classList.toggle("is-open", open);
        document.body.style.overflow = open ? "hidden" : "";
      });
      panel.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          burger.classList.remove("is-open");
          panel.classList.remove("is-open");
          document.body.style.overflow = "";
        });
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
        return '<a class="pill" href="resources.html?tag=' + t + '" data-tag="' + t + '" title="' + tag.desc + '">' + tag.label + "</a>";
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
            '<a class="ac-link" href="' + a.url + '"' + ctaAttrs + ">" + ctaLabel + " " + arrow + "</a>" +
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
    if (tagEl) tagEl.textContent = Object.keys(TAGS).length;
    var pinnedEl = document.getElementById("pinned-count");
    if (pinnedEl) pinnedEl.textContent = pinned.length;
  }

  /* ---------------- Resources: full archive render + filters ---------------- */
  var activeFilters = { tag: "all", type: "all" };

  // Filter state lives in the URL (?tag=…&type=…) so any filtered view can be
  // shared as a link. Unknown values fall back to "all".
  function readFiltersFromURL() {
    var params = new URLSearchParams(window.location.search);
    var tag = params.get("tag"), type = params.get("type");
    activeFilters.tag = tag && TAGS[tag] ? tag : "all";
    activeFilters.type = type && TYPE_COPY[type] ? type : "all";
  }

  function writeFiltersToURL() {
    var params = new URLSearchParams();
    if (activeFilters.tag !== "all") params.set("tag", activeFilters.tag);
    if (activeFilters.type !== "all") params.set("type", activeFilters.type);
    var qs = params.toString();
    history.replaceState(null, "", window.location.pathname + (qs ? "?" + qs : ""));
  }

  function syncChips() {
    document.querySelectorAll("[data-filter-tag]").forEach(function (c) {
      c.classList.toggle("is-active", c.getAttribute("data-filter-tag") === activeFilters.tag);
    });
    document.querySelectorAll("[data-filter-type]").forEach(function (c) {
      c.classList.toggle("is-active", c.getAttribute("data-filter-type") === activeFilters.type);
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
    var cards = document.querySelectorAll(".artifact-card");
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
    var emptyEl = document.getElementById("resources-empty");
    if (emptyEl) emptyEl.hidden = visibleCount !== 0;
  }

  function initFilters(list) {
    document.querySelectorAll("[data-filter-tag]").forEach(function (chip) {
      chip.addEventListener("click", function () { setFilters({ tag: chip.getAttribute("data-filter-tag") }); });
    });
    document.querySelectorAll("[data-filter-type]").forEach(function (chip) {
      chip.addEventListener("click", function () { setFilters({ type: chip.getAttribute("data-filter-type") }); });
    });
    var clear = document.getElementById("clear-filters");
    if (clear) clear.addEventListener("click", function () { setFilters({ tag: "all", type: "all" }); });

    // On Resources, a card's tag pill filters in place instead of reloading
    list.addEventListener("click", function (e) {
      var pill = e.target.closest("a.pill[data-tag]");
      if (!pill) return;
      e.preventDefault();
      setFilters({ tag: pill.getAttribute("data-tag") });
      var bar = document.querySelector(".filters");
      if (bar) bar.scrollIntoView({ block: "start" });
    });
  }

  function buildTagFilterChips() {
    var wrap = document.getElementById("tag-filter-group");
    if (!wrap) return;
    var chips = ['<button class="chip is-active" type="button" data-filter-tag="all">All</button>'];
    Object.keys(TAGS).forEach(function (key) {
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
    initFilters(list);
    applyFilters();
  }

  /* ---------------- Motion: scroll reveal ----------------
     Grouped content fades up as it enters the viewport. Each batch that
     enters together is staggered with the brand's .d1–.d6 steps, so items
     never all animate at once. Reduced motion: everything shows at once. */
  function initReveal() {
    var items = document.querySelectorAll(".artifact-card, .format-card");
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    items.forEach(function (el) { el.classList.add("reveal"); });
    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (e) { return e.isIntersecting; })
        .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left; });
      batch.forEach(function (entry, i) {
        entry.target.classList.add("d" + Math.min(i + 1, 6), "is-visible");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initFooterYear();
    renderPinned();
    renderResources();
    initReveal();
  });
})();
