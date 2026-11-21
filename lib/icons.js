/**
 * DN Design Hub — icon set (build time)
 * Monochrome line icons (24px grid, 1.5px stroke, currentColor) so icons
 * inherit the palette instead of bringing in emoji colours. Rendered into
 * the HTML at build time: in templates, {{ "link" | icon | safe }}.
 */
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
  // topics (data.js TAGS[key].icon)
  puzzle:    '<path d="M5 8h3.5a2.5 2.5 0 0 1 5 0H17v3.5a2.5 2.5 0 0 1 0 5V20H5v-3.5a2.5 2.5 0 0 0 0-5z"/>',
  eye:       '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  grid:      '<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><path d="M13 16.5h7M16.5 13v7"/>',
  nodes:     '<circle cx="12" cy="5" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><path d="M12 7v4M12 11l-5.6 5.6M12 11l5.6 5.6"/>',
  chip:      '<rect x="7" y="7" width="10" height="10"/><rect x="10" y="10" width="4" height="4"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>',
  bulb:      '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  tag:       '<path d="M3 12V4h8l9 9-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/>',
  // ui
  search:    '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  pause:     '<path d="M9 6v12M15 6v12"/>',
  play:      '<path d="M8 5.5l11 6.5-11 6.5z"/>',
  pin:       '<path d="M12 21s-7-7.6-7-12a7 7 0 0 1 14 0c0 4.4-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
};

function icon(name) {
  var p = PATHS[name];
  if (!p) return "";
  return '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" ' +
    'stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true" focusable="false">' + p + "</svg>";
}


module.exports = { icon: icon, names: Object.keys(PATHS) };
