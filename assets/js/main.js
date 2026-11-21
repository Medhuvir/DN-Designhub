/**
 * DN Design Hub — shared behavior
 * Nav (hamburger, condensing, search, Follow handoff), archive filters,
 * the New in ticker, scroll reveal.
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
     values are read off the chips, so nothing here repeats the data.
     Topic only: format filtering was dropped Nov 21, 2026 (every card shows
     its format); an old ?type= link just lands on the full archive. */
  var activeFilters = { tag: "all" };

  function chipValues(attr) {
    return [].map.call(document.querySelectorAll("[" + attr + "]"), function (c) {
      return c.getAttribute(attr);
    }).filter(function (v) { return v !== "all"; });
  }

  // Links shared before the Nov 2026 topic refresh used the old tag keys.
  // Map them to their closest new topic.
  var LEGACY_TAGS = {
    "skills-agents": "claude-skills", "ux": "ux-research", "research": "ux-research",
    "design": "design-systems", "engineering": "agent-architecture",
  };

  // Filter state lives in the URL (?tag=…) so any filtered view can be
  // shared as a link. Unknown values fall back to "all".
  function readFiltersFromURL() {
    var tag = new URLSearchParams(window.location.search).get("tag");
    if (tag && LEGACY_TAGS[tag]) tag = LEGACY_TAGS[tag];
    activeFilters.tag = tag && chipValues("data-filter-tag").indexOf(tag) !== -1 ? tag : "all";
  }

  function writeFiltersToURL() {
    var params = new URLSearchParams();
    if (activeFilters.tag !== "all") params.set("tag", activeFilters.tag);
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
  }

  function setFilters(next) {
    if (next.tag) activeFilters.tag = next.tag;
    syncChips();
    applyFilters();
    writeFiltersToURL();
  }

  function applyFilters() {
    var cards = document.querySelectorAll("#resources-grid .artifact-card");
    var visibleCount = 0;
    cards.forEach(function (card) {
      var tags = card.getAttribute("data-tags").split(",");
      var show = activeFilters.tag === "all" || tags.indexOf(activeFilters.tag) !== -1;
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
    var clear = document.getElementById("clear-filters");
    if (clear) clear.addEventListener("click", function () { setFilters({ tag: "all" }); });

    // A card's topic pill links to that topic's page; on the home page it
    // filters the archive in place instead (new-tab clicks still open the page)
    document.addEventListener("click", function (e) {
      var pill = e.target.closest("a[data-tag]");
      if (!pill || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      setFilters({ tag: pill.getAttribute("data-tag") });
      closeSearches();
      if (archive) archive.scrollIntoView({ block: "start" });
    });

    readFiltersFromURL();
    writeFiltersToURL();   // normalise: drops unknown values from the address bar
    syncChips();
    applyFilters();
  }

  /* ---------------- Search ----------------
     Every [data-search] (nav, hero on phones, mobile menu) searches the
     #search-index JSON the build inlines. Empty: topics + the latest three.
     Typing: ranked matches (title first, then source, topics, description).
     / focuses, arrows move, Enter opens the resource page, Esc closes. */
  var INDEX = null, closers = [];
  function closeSearches() { closers.forEach(function (c) { c(); }); }
  function esc(str) { return String(str).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function topicByKey(k) { for (var i = 0; i < INDEX.topics.length; i++) if (INDEX.topics[i].key === k) return INDEX.topics[i]; return null; }
  function hl(text, q) {
    var i = text.toLowerCase().indexOf(q.toLowerCase());
    if (!q || i < 0) return esc(text);
    return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length));
  }
  function topicChip(t) {
    return '<a class="topic-chip topic-chip--sm t-' + t.key + '" href="/topics/' + t.key + '/" data-tag="' + t.key + '"><span class="topic-chip__icon">' + t.icon + "</span>" + esc(t.label) + '<span class="topic-chip__n">' + t.n + "</span></a>";
  }
  function rank(q) {
    var ql = q.toLowerCase(), words = ql.split(/\s+/).filter(Boolean);
    return INDEX.resources.map(function (r) {
      var title = r.title.toLowerCase(), hay = (r.title + " " + r.text).toLowerCase(), score = 0;
      if (!words.every(function (w) { return hay.indexOf(w) !== -1; })) return null;
      if (title.indexOf(ql) === 0) score += 6; else if (title.indexOf(ql) !== -1) score += 4;
      words.forEach(function (w) { if (title.indexOf(w) !== -1) score += 2; if (r.source.toLowerCase().indexOf(w) !== -1) score += 1; });
      return { r: r, score: score };
    }).filter(Boolean).sort(function (a, b) { return b.score - a.score; }).map(function (x) { return x.r; });
  }

  function initSearch() {
    var boxes = document.querySelectorAll("[data-search]");
    var raw = document.getElementById("search-index");
    if (!boxes.length || !raw) return;
    try { INDEX = JSON.parse(raw.textContent); } catch (e) { return; }

    boxes.forEach(function (box) {
      var input = box.querySelector("input"), panel = box.querySelector(".search__panel");
      var pid = panel.id, hits = [], sel = -1;
      function open() { panel.hidden = false; input.setAttribute("aria-expanded", "true"); }
      function close() { panel.hidden = true; input.setAttribute("aria-expanded", "false"); input.removeAttribute("aria-activedescendant"); sel = -1; }
      closers.push(close);

      function row(r, i, q) {
        var t0 = r.tags[0], type = INDEX.types[r.type];
        return '<li role="option" id="' + pid + "-" + i + '" aria-selected="' + (i === sel) + '">' +
          '<a class="sp-row t-' + t0 + '" href="/r/' + r.id + '/" tabindex="-1" aria-selected="' + (i === sel) + '">' +
          '<span class="sp-title">' + hl(r.title, q) + "</span>" +
          '<span class="sp-meta"><span class="sp-type">' + type.icon + esc(type.label) + "</span>" +
          r.tags.map(function (k) { var t = topicByKey(k); return t ? '<span class="ttag t-' + k + '">' + t.icon + esc(t.label) + "</span>" : ""; }).join("") +
          "</span></a></li>";
      }
      function render() {
        var q = input.value.trim(), html;
        if (!q) {
          hits = INDEX.resources.slice(0, 3);
          html = '<div class="sp-head">Topics</div><div class="sp-topics">' + INDEX.topics.map(topicChip).join("") + "</div>" +
            '<div class="sp-head">Latest</div><ul class="sp-list" role="listbox" aria-label="Latest resources">' + hits.map(function (r, i) { return row(r, i, ""); }).join("") + "</ul>";
        } else {
          hits = rank(q).slice(0, 7);
          html = hits.length
            ? '<div class="sp-head">' + hits.length + (hits.length === 1 ? " match" : " matches") + '</div><ul class="sp-list" role="listbox" aria-label="Matching resources">' + hits.map(function (r, i) { return row(r, i, q); }).join("") + "</ul>"
            : '<p class="sp-empty">Nothing matches &ldquo;' + esc(q) + '&rdquo;. Try a topic:</p><div class="sp-topics">' + INDEX.topics.map(topicChip).join("") + "</div>";
        }
        html += '<div class="sp-foot"><span><kbd>&uarr;</kbd><kbd>&darr;</kbd>move</span><span><kbd>Enter</kbd>open</span><span><kbd>Esc</kbd>close</span></div>';
        panel.innerHTML = html;
        if (sel >= 0 && hits[sel]) input.setAttribute("aria-activedescendant", pid + "-" + sel); else input.removeAttribute("aria-activedescendant");
        open();
      }
      function move(d) {
        if (!hits.length) return;
        sel = sel < 0 ? (d > 0 ? 0 : hits.length - 1) : (sel + d + hits.length) % hits.length;
        render();
        var cur = panel.querySelector('[aria-selected="true"]');
        if (cur) cur.scrollIntoView({ block: "nearest" });
      }
      input.addEventListener("focus", render);
      input.addEventListener("input", function () { sel = -1; render(); });
      input.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
        else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
        else if (e.key === "Enter") {
          var r = hits[sel < 0 ? 0 : sel];
          if (r && (input.value.trim() || sel >= 0)) { e.preventDefault(); window.location.href = "/r/" + r.id + "/"; }
        } else if (e.key === "Escape") {
          e.preventDefault();      // a search input clears itself on Esc natively, which would reopen the panel
          e.stopPropagation();
          if (!panel.hidden) close(); else { input.value = ""; input.blur(); }
        }
      });
      // Close when focus or a click lands outside this search
      box.addEventListener("focusout", function () {
        setTimeout(function () { if (!box.contains(document.activeElement)) close(); }, 0);
      });
      document.addEventListener("pointerdown", function (e) { if (!box.contains(e.target)) close(); });
    });

    // "/" focuses whichever search is visible
    document.addEventListener("keydown", function (e) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      var t = document.activeElement;
      if (t && (/^(input|textarea|select)$/i.test(t.tagName) || t.isContentEditable)) return;
      var vis = [].find.call(document.querySelectorAll("[data-search] input"), function (i) { return i.offsetParent; });
      if (vis) { e.preventDefault(); vis.focus(); }
    });
  }

  /* ---------------- Nav: condense on scroll + Follow handoff ---------------- */
  function initNavScroll() {
    var nav = document.querySelector(".site-nav");
    if (!nav) return;
    var queued = false;
    function update() { queued = false; nav.classList.toggle("is-condensed", window.scrollY > 24); }
    window.addEventListener("scroll", function () { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
    update();

    // Home: once the hero's Follow button has scrolled up out of view, the
    // nav's compact Follow takes over, so one orange button is ever visible
    var heroCta = document.querySelector("[data-hero-cta]"), follow = nav.querySelector(".nav-follow");
    if (!heroCta || !follow || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (entries) {
      var e = entries[0], gone = !e.isIntersecting && e.boundingClientRect.top < 80;
      nav.classList.toggle("is-handoff", gone);
      follow.tabIndex = gone ? 0 : -1;
      follow.setAttribute("aria-hidden", gone ? "false" : "true");
    }, { rootMargin: "-76px 0px 0px 0px" }).observe(heroCta);
  }

  /* ---------------- New in ticker ----------------
     Constant reading speed whatever the number of resources (about 40px/s).
     Pauses on hover and focus (CSS) and with its button. */
  function initTicker() {
    var ticker = document.querySelector("[data-ticker]");
    if (!ticker) return;
    var track = ticker.querySelector(".ticker__track"), list = ticker.querySelector(".ticker__list");
    function speed() { if (list.offsetWidth) track.style.setProperty("--ticker-dur", Math.round(list.offsetWidth / 40) + "s"); }
    speed();
    window.addEventListener("load", speed);
    var btn = ticker.querySelector(".ticker__toggle");
    btn.addEventListener("click", function () {
      var paused = ticker.classList.toggle("is-paused");
      btn.setAttribute("aria-pressed", paused);
      btn.setAttribute("aria-label", paused ? "Play the New in ticker" : "Pause the New in ticker");
    });
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
    initNavScroll();
    initSearch();
    initTicker();
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
