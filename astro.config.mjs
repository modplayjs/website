// SPDX-License-Identifier: BSD-3-Clause
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Everything is static. There is no server, no client framework and no
// hydration: the site is HTML plus one stylesheet.
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    assets: 'assets',
  },
});
