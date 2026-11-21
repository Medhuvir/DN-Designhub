// JSON-LD (schema.org) for each page type. Every page carries the same
// identity nodes (the hub, Dan, DN Creative) so it stands on its own, plus
// the nodes for what that page is about.
"use strict";

const abs = (site, p) => (/^https?:\/\//.test(p) ? p : site.url + "/" + String(p).replace(/^\//, ""));
const ids = (site) => ({
  website: site.url + "/#website",
  person: site.url + "/#dan",
  org: site.org.url + "/#org",
});

function identity(site) {
  const id = ids(site);
  const p = site.person;
  return [
    {
      "@type": "WebSite",
      "@id": id.website,
      url: site.url + "/",
      name: site.name,
      alternateName: site.title,
      description: site.description,
      inLanguage: "en",
      author: { "@id": id.person },
      publisher: { "@id": id.org },
    },
    {
      "@type": "Person",
      "@id": id.person,
      name: p.name,
      jobTitle: p.role.replace(/ · /g, ", "),
      description: p.bio,
      image: abs(site, p.image),
      url: p.website,
      sameAs: [p.linkedin, p.github, p.website],
      homeLocation: { "@type": "Place", name: p.location },
      worksFor: { "@id": id.org },
    },
    {
      "@type": "Organization",
      "@id": id.org,
      name: site.org.name,
      url: site.org.url,
      founder: { "@id": id.person },
    },
  ];
}

function itemList(site, items) {
  return {
    "@type": "ItemList",
    numberOfItems: items.length,
    itemListElement: items.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: site.url + "/r/" + r.id + "/",
      name: r.title,
    })),
  };
}

function breadcrumbs(site, trail) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map(([name, url], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      ...(url ? { item: site.url + url } : {}),
    })),
  };
}

// The thing a resource page is about, typed by what it actually is
function subject(site, r, hub) {
  const isRepo = /^https:\/\/github\.com\//.test(r.url);
  const type =
    r.type === "video" ? "VideoObject" :
    r.type === "explainer" ? "Article" :
    isRepo ? "SoftwareSourceCode" : "CreativeWork";
  const node = {
    "@type": type,
    name: r.title,
    description: r.description,
    url: abs(site, r.url),
    keywords: r.tags.map((t) => hub.tags[t].label).join(", "),
  };
  if (type === "Article") node.headline = r.title;
  if (isRepo) node.codeRepository = r.url.split("/").slice(0, 5).join("/");
  if (r.type === "download") node.encodingFormat = r.url.endsWith(".zip") ? "application/zip" : undefined;
  if (r.thumbnail) node[type === "VideoObject" ? "thumbnailUrl" : "image"] = abs(site, r.thumbnail);
  return JSON.parse(JSON.stringify(node)); // drops undefined keys
}

module.exports = {
  home(hub, site) {
    return {
      "@context": "https://schema.org",
      "@graph": [
        ...identity(site),
        {
          "@type": "CollectionPage",
          "@id": site.url + "/#page",
          url: site.url + "/",
          name: site.title,
          description: site.description,
          isPartOf: { "@id": ids(site).website },
          author: { "@id": ids(site).person },
          dateModified: hub.latest,
          mainEntity: itemList(site, hub.resources),
        },
      ],
    };
  },

  topic(t, hub, site) {
    const url = site.url + "/topics/" + t.key + "/";
    return {
      "@context": "https://schema.org",
      "@graph": [
        ...identity(site),
        {
          "@type": "CollectionPage",
          "@id": url + "#page",
          url,
          name: t.label,
          description: t.desc,
          isPartOf: { "@id": ids(site).website },
          author: { "@id": ids(site).person },
          dateModified: t.latest,
          mainEntity: itemList(site, t.resources),
          breadcrumb: breadcrumbs(site, [["Hub", "/"], [t.label, null]]),
        },
      ],
    };
  },

  resource(r, hub, site) {
    const url = site.url + "/r/" + r.id + "/";
    const first = hub.tags[r.tags[0]];
    return {
      "@context": "https://schema.org",
      "@graph": [
        ...identity(site),
        {
          "@type": "WebPage",
          "@id": url + "#page",
          url,
          name: r.title,
          description: r.description,
          isPartOf: { "@id": ids(site).website },
          author: { "@id": ids(site).person },
          datePublished: r.dateAdded,
          mainEntity: subject(site, r, hub),
          breadcrumb: breadcrumbs(site, [["Hub", "/"], [first.label, "/topics/" + r.tags[0] + "/"], [r.title, null]]),
        },
      ],
    };
  },
};
