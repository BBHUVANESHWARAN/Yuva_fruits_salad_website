# Yuva Fruits Salad — website

Fresh fruit bowls, fruit chaat, fitness bowls, kids bowls and fresh juices.
Customers build their order on the site and send it to the shop on WhatsApp.

- **Live site:** https://bbhuvaneshwaran.github.io/Yuva_fruits_salad_website/
- **Hosting:** GitHub Pages (free, HTTPS included). Every push to `main` redeploys in about a minute.
- **Stack:** plain HTML, CSS and JavaScript. No framework, no build step, no server, no database.

## Change your details, menu and prices

Everything lives in **one file: [`js/config.js`](js/config.js)**.

1. On GitHub, open `js/config.js` and click the pencil icon (**Edit this file**).
2. Change what you need:
   - **WhatsApp number:** `whatsapp: "919876543210"` — country code + number, digits only.
   - **Phone:** `phone: "+91 98765 43210"`
   - **Address, city, hours:** `addressLines`, `city`, `hours`
   - **Map:** `mapsQuery: "Yuva Fruits Salad, Gandhi Road, Coimbatore"`
   - **UPI, Instagram, Swiggy, Zomato, FSSAI:** fill the matching line. Empty `""` hides it.
   - **Menu:** each item has a `name`, `description`, `tags` and `sizes` with a `price` (a plain number, no ₹).
   - **Bowl builder:** sizes, fruits (with `extra` cost) and toppings under `builder`.
   - **Daily plans:** `plans.options` — days and price per day.
   - **Offer strip:** `offer.todaysSpecial` and `offer.firstOrderCode`.
3. Click **Commit changes**. The site updates in about a minute (watch the **Actions** tab).

Tip: keep the quotes and commas exactly as they are. If the menu disappears after a change,
a comma or quote is probably missing — open the **Actions** tab to see the error, or undo your last commit.

## Add real photos

Put the photo in `assets/` (for example `assets/shop.jpg`), then in `index.html` find
`PHOTO SLOT` and replace the placeholder `<div>` with the `<img>` line written in the comment.

## Run it on your computer

Open `index.html` in a browser, or for a closer match to the live site:

```bash
npx serve .
```

## How it is built

| File | What it does |
| --- | --- |
| `index.html` | The single page and its sections |
| `css/style.css` | All styles; colours are CSS variables at the top |
| `js/config.js` | **Edit this.** Business details, menu, prices, builder, plans |
| `js/bowl.js` | Draws the steel fruit bowl as SVG (no photos needed) |
| `js/app.js` | Menu tabs, order tray, bowl builder, plans, party form, WhatsApp messages |
| `.github/workflows/deploy.yml` | Checks the JavaScript, then deploys to GitHub Pages |
| `404.html`, `robots.txt`, `sitemap.xml` | Not-found page and SEO |

Orders are not stored anywhere: the site only builds a WhatsApp message. The order tray is kept
in the customer's own browser (localStorage) so it survives a page refresh.

## Optional upgrades

- **Custom domain** (e.g. `yuvafruits.in`): add a file named `CNAME` containing the domain, point the
  domain's DNS to GitHub Pages, then tick **Enforce HTTPS** in Settings → Pages. Update `siteUrl` in
  `js/config.js` and the URLs in `index.html`, `robots.txt` and `sitemap.xml`.
- **Google Analytics 4**: paste the GA4 snippet just before `</head>` in `index.html`.
- **Google Business Profile**: put your review link in `googleReviewsUrl`.
- **Social share image**: WhatsApp and Facebook previews need a PNG/JPG. Export `assets/og-image.svg`
  to `assets/og-image.png` (1200×630) and change the `og:image` line in `index.html`.
