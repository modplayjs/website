import type { APIRoute } from 'astro';

// Prerendered with the rest of the site. The sitemap line is only written when
// the build knows its origin; a sitemap URL is not invented.
export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const lines = ['User-agent: *', 'Allow: /'];

  if (site) {
    lines.push('', `Sitemap: ${new URL('sitemap-index.xml', site).href}`);
  }

  return new Response(`${lines.join('\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
