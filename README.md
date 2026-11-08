# modplayjs — website

The public site for the modplayjs library and its two apps. Astro, static
output, Tailwind CSS 4 with DaisyUI 5 as the component base.

This folder is its own git repository and is ignored by the parent repo.
There is no remote yet.

## Commands

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # writes dist/
npm run preview   # serves dist/
```

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

Adding a package means adding one entry to `categories` in
`src/data/site.ts`; the API index, category page and package counts follow.

## Design

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
