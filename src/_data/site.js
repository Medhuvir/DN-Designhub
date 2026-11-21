// Site-wide constants: the canonical origin, the hub's own copy, and the
// curator / studio identities used in meta tags, the rail and JSON-LD.
// Profile URLs are the confirmed ones only (see CLAUDE.md §8): never guess.
module.exports = {
  url: "https://hub.dncreative.studio",
  year: new Date().getFullYear(),   // footer copyright; main.js also refreshes it in the browser
  name: "DN Design Hub",
  title: "One Hub to Rule Them All",
  description: "Free, curated resources for design, UX and AI work from Dan Nemirovsky: Claude skills, design systems, agent architecture and more.",
  ogImage: "/assets/img/og/hub.jpg",
  ogImageAlt: "DN Design Hub: One Hub to Rule Them All. Curated design, UX and AI resources from Dan Nemirovsky.",
  person: {
    name: "Dan Nemirovsky",
    role: "Design Leader · AI Builder · Org Fixer",
    bio: "Designer, strategist, and product thinker with 20+ years building teams and products across finance, healthcare, tech, and automotive.",
    location: "Hudson Valley, NY",
    image: "/assets/img/dan-headshot.jpg",
    linkedin: "https://www.linkedin.com/in/dannemirovsky/",
    github: "https://github.com/Medhuvir",
    website: "https://dannemirovsky.com",
  },
  org: {
    name: "DN Creative",
    url: "https://dncreative.studio",
  },
};
