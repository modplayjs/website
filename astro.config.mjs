// SPDX-License-Identifier: BSD-3-Clause
import { copyFile } from 'node:fs/promises';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// @astrojs/sitemap always writes `sitemap-index.xml` (plus its chunks), but
// crawlers, Search Console and anyone typing the URL expect `/sitemap.xml`.
// Keep the index as the single source and publish the same document at the
// conventional path, so the two cannot drift.
function sitemapAlias() {
  return {
    name: 'sitemap-alias',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        try {
          await copyFile(new URL('sitemap-index.xml', dir), new URL('sitemap.xml', dir));
          logger.info('published /sitemap.xml');
        } catch {
          logger.warn('no sitemap-index.xml to publish at /sitemap.xml');
        }
      },
    },
  };
}

// Canonical links, Open Graph URLs and the sitemap are absolute, so the build
// needs the origin the site is served from. The Worker is attached to
// modplayjs.org in wrangler.jsonc, so that is the default. SITE_URL overrides
// it for a staging deploy without touching the committed value.
const site = (process.env.SITE_URL ?? 'https://modplayjs.org').replace(/\/+$/, '');

if (!/^https?:\/\//.test(site)) {
  throw new Error(`SITE_URL must start with http:// or https:// (got "${site}")`);
}

// Everything is static. There is no server, no client framework and no
// hydration: the site is HTML plus one stylesheet.
export default defineConfig({
  site,
  // The dev toolbar is not part of the site and would sit over the hero in
  // screenshots taken from the dev server.
  devToolbar: { enabled: false },
  integrations: [
    sitemap({ namespaces: { news: false, xhtml: false, image: false, video: false } }),
    sitemapAlias(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    assets: 'assets',
  },
});
