// SPDX-License-Identifier: BSD-3-Clause
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Everything is static. There is no server, no client framework and no
// hydration: the site is HTML plus one stylesheet.
export default defineConfig({
  // The dev toolbar is not part of the site and would sit over the hero in
  // screenshots taken from the dev server.
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    assets: 'assets',
  },
});
