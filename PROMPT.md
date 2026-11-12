# Build prompt

This website was built from an end-to-end build prompt for "Yuva Fruits Salad":
a single-page, framework-free business site (HTML, CSS, vanilla JS) where all
business details, menu, prices, bowl-builder options and subscription plans live in
`js/config.js`; ordering happens through pre-filled WhatsApp messages; and the site is
hosted for free on GitHub Pages, deployed by GitHub Actions on every push to `main`.

Key requirements from the prompt:

- Sections: offer strip, sticky header, hero with animated SVG fruit bowl, menu price board
  with category tabs, build-your-own bowl with live price and preview, 7/15/30-day plans,
  party and office enquiry form, why people come back + our story, Google reviews link
  (no invented testimonials), visit/order with map, footer with FSSAI number.
- Floating WhatsApp button and an order tray that sends every item, quantity, line total and
  grand total on WhatsApp.
- Colours: mango #FFB320, leaf green #17643A, ink green #0E2A1C, watermelon #E5384F,
  mint #E9F5EC, WhatsApp green #1FA855. Fonts: Rozha One + Hind.
- Mobile first, 44px tap targets, visible focus, prefers-reduced-motion, WCAG AA contrast.
- SEO: title, description, Open Graph, theme-color, schema.org Restaurant JSON-LD,
  robots.txt and sitemap.xml.
