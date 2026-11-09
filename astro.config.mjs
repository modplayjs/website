// SPDX-License-Identifier: BSD-3-Clause
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Canonical links, Open Graph URLs and the sitemap need the origin the site is
// served from. It is not guessed here: set SITE_URL for the build that is
// deployed (dashboard variable, CI secret or inline). Without it the build
// still works, but those tags are left out rather than pointing at a host that
// does not serve the page.
const site = process.env.SITE_URL?.replace(/\/+$/, '');

if (site && !/^https?:\/\//.test(site)) {
  throw new Error(`SITE_URL must start with http:// or https:// (got "${site}")`);
}

if (!site) {
  console.warn(
    '[modplayjs] SITE_URL is not set. Canonical links, og:url, the robots.txt sitemap line and sitemap.xml are omitted.',
  );
}

// Everything is static. There is no server, no client framework and no
// hydration: the site is HTML plus one stylesheet.
export default defineConfig({
  site,
  // The dev toolbar is not part of the site and would sit over the hero in
  // screenshots taken from the dev server.
  devToolbar: { enabled: false },
  integrations: site
    ? [sitemap({ namespaces: { news: false, xhtml: false, image: false, video: false } })]
    : [],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    assets: 'assets',
  },
});
