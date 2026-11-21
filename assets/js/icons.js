/**
 * DN Design Hub — icon set
 * Monochrome line icons (24px grid, 1.5px stroke, currentColor) so icons
 * inherit the palette instead of bringing in emoji colours. Use either:
 *   - in markup:  <span class="icon" data-icon="link"></span>  (hydrated on load)
 *   - in JS:      DN_ICON("link")  → SVG string
 */
(function () {
  "use strict";

  var PATHS = {
    // formats
    link:      '<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>',
    download:  '<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 20h16"/>',
    explainer: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 12h7M9 16h7"/>',
    video:     '<rect x="3" y="5" width="18" height="14"/><path d="M10 9l5 3-5 3z"/>',
    // about
    coffee:    '<path d="M4 9h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 11h2a2 2 0 0 1 0 4h-2"/><path d="M8 3v3M12 3v3"/>',
    camera:    '<path d="M3 8h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="13.5" r="3.5"/>',
    mountain:  '<path d="M2 20l7-12 4 6 3-4 6 10z"/>',
    type:      '<path d="M5 7V4h14v3"/><path d="M12 4v16"/><path d="M9 20h6"/>',
    spark:     '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15v5M16.5 17.5h5"/>',
    target:    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    pin:       '<path d="M12 21s-7-7.6-7-12a7 7 0 0 1 14 0c0 4.4-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  };

  function icon(name) {
    var p = PATHS[name];
    if (!p) return "";
    return '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" ' +
      'stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true" focusable="false">' + p + "</svg>";
  }

  window.DN_ICON = icon;

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-icon]").forEach(function (el) {
      el.innerHTML = icon(el.getAttribute("data-icon"));
    });
  });
})();
