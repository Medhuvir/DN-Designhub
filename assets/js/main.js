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

  /* ---------------- Helpers ---------------- */
  function fmtDate(iso) {
    var d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  function tagPillRow(tags) {
    return (
      '<div class="pill-row">' +
      tags.map(function (t) {
        var tag = TAGS[t];
        if (!tag) return "";
        return '<span class="pill" title="' + tag.desc + '">' + tag.label + "</span>";
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
    return (
      '<article class="artifact-card" data-type="' + a.type + '" data-tags="' + a.tags.join(",") + '" data-id="' + a.id + '">' +
        thumb +
        '<div class="ac-top">' +
          '<span class="ac-type">' + tc.icon + " " + tc.label + "</span>" +
          placeholderBadge +
        "</div>" +
        '<h3 class="ac-title">' + a.title + "</h3>" +
        (a.source ? '<div class="ac-source">' + a.source + "</div>" : "") +
        '<p class="ac-desc">' + a.description + "</p>" +
        tagPillRow(a.tags) +
        '<div class="ac-foot">' +
          '<span class="ac-date">Added ' + fmtDate(a.dateAdded) + "</span>" +
          '<a class="ac-link" href="' + a.url + '" target="_blank" rel="noopener">Open &rarr;</a>' +
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
    // data.js. Capped to 4 as a safety net if more than 4 get marked pinned.
    var visible = ARTIFACTS.filter(function (a) { return !a.placeholder; });
    var pinned = visible.filter(function (a) { return a.pinned; }).slice(0, 4);

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
    if (emptyEl) emptyEl.style.display = visibleCount === 0 ? "block" : "none";
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-tag]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        document.querySelectorAll("[data-filter-tag]").forEach(function (c) { c.classList.remove("is-active"); });
        chip.classList.add("is-active");
        activeFilters.tag = chip.getAttribute("data-filter-tag");
        applyFilters();
      });
    });
    document.querySelectorAll("[data-filter-type]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        document.querySelectorAll("[data-filter-type]").forEach(function (c) { c.classList.remove("is-active"); });
        chip.classList.add("is-active");
        activeFilters.type = chip.getAttribute("data-filter-type");
        applyFilters();
      });
    });
  }

  function buildTagFilterChips() {
    var wrap = document.getElementById("tag-filter-group");
    if (!wrap) return;
    var chips = ['<button class="chip is-active" data-filter-tag="all">All topics</button>'];
    Object.keys(TAGS).forEach(function (key) {
      chips.push('<button class="chip" data-filter-tag="' + key + '">' + TAGS[key].label + "</button>");
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

    initFilters();
    applyFilters();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    renderPinned();
    renderResources();
  });
})();
