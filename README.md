# modplayjs — website

The public site for the modplayjs library and its two apps. Astro, static
output, Tailwind CSS 4 with DaisyUI 5 as the component base.

This folder is its own git repository and is ignored by the parent repo.
There is no remote yet.

## Commands

```bash
npm install
npm run dev            # http://localhost:4321
npm run build          # writes dist/
npm run preview        # serves dist/ with Astro
npm run preview:worker # serves dist/ the way Workers will
```

`build` needs `SITE_URL` to emit canonical links and a sitemap; see
[Deploy](#deploy).

## Where content lives

Almost everything is data, not markup:

| File | Holds |
| --- | --- |
| `src/data/site.ts` | versions, package list and roles, API categories, format table, verification figures |
| `src/pages/index.astro` | landing page |
| `src/pages/android.astro` | Android app page |
| `src/pages/xr.astro` | XR app page |
| `src/pages/api/index.astro` | API index |
| `src/pages/api/[category].astro` | one page per API category, generated from `categories` |
| `src/pages/robots.txt.ts` | `robots.txt`, with the sitemap line only when `SITE_URL` is known |

Adding a package means adding one entry to `categories` in
`src/data/site.ts`; the API index, category page and package counts follow.

## Deploy

The site is a Workers **static assets** project: no Worker script, no adapter,
no server rendering. `wrangler.jsonc` points at `dist/` and asks Workers to
serve `404.html` with a 404 status for anything that is not a file. Worker
names are account-wide, so change `name` there if `modplayjs-webpage` is taken.

```bash
SITE_URL=https://modplayjs-webpage.<account>.workers.dev npm run deploy
```

`deploy` refuses to run without `SITE_URL`: canonical links, `og:url` and the
sitemap are baked into the HTML at build time, and a deploy without them
advertises the wrong origin. For Cloudflare's Git integration set `SITE_URL`
as a build variable and use `npm run build` with `npx wrangler deploy`.

There is no remote for this repository yet; nothing is pushed anywhere.

## SEO

Everything below is emitted only when `SITE_URL` is set. Without it the build
still works, but no canonical is written and no sitemap is generated, rather
than pointing at a host that does not serve the page.

| Output | Where |
| --- | --- |
| `<title>` and description per page | `Base.astro` props; pages pass their own |
| canonical, `og:url`, `og:image` | absolute, trailing slash to match Workers `html_handling` |
| Open Graph and Twitter tags | `Base.astro`, image is `public/og.png` |
| JSON-LD | `WebSite` + `SoftwareSourceCode` on every page |
| `sitemap-index.xml`, `sitemap-0.xml` | `@astrojs/sitemap` |
| `robots.txt` | generated from `site`, so the sitemap URL cannot drift |
| `404` | `noindex`, no canonical, served by Workers with a 404 status |

`public/_headers` gives the hashed `/assets/*` files a one-year immutable
cache and adds `nosniff` and a referrer policy everywhere.

The social card is `design/og-card.html`, rendered at 1200 × 630:

```bash
chrome --headless --window-size=1200,630 --allow-file-access-from-files \
  --screenshot=public/og.png design/og-card.html
```

## Design

- **Two layouts:** the landing page is a full-width hero under a sticky top
  bar (`layout="top"` in `Base.astro`); every other page keeps the numbered
  rail on the left, because reference pages are read by jumping between
  sections. Both share the same four destinations and the same footer.
- **Type:** Silkscreen for the wordmark, Archivo for text, IBM Plex Mono for
  data and labels. Fonts are bundled via Fontsource, not fetched at runtime.
- **Colour:** a DaisyUI theme named `modplay` in `src/styles/global.css`,
  derived from the app's own palette. Components come from DaisyUI; the page
  uses its classes rather than a second CSS layer.
- **Custom CSS:** two rules — the faint tracker-grid lines behind the page and
  the hatching on disabled download buttons. Everything else is utilities.
- **No client JavaScript**, no analytics, no external requests.

Downloads are intentionally disabled buttons with a “coming soon” badge; they
become links when the first signed builds are published.

## License

BSD-3-Clause. See `LICENSE`.
