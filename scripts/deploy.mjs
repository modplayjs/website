// Deploy the built site to Cloudflare Workers. SITE_URL is required here, not
// just recommended: canonical links, og:url and the sitemap are written into
// the HTML at build time, and a deploy without them ships a site that tells
// search engines the wrong origin (or none at all).
import { execSync } from 'node:child_process';

const site = process.env.SITE_URL;

if (!site) {
  console.error(
    [
      'SITE_URL is not set. Pass the origin the Worker is served from:',
      '',
      '  SITE_URL=https://modplayjs-webpage.<account>.workers.dev npm run deploy',
      '',
      'For a custom domain use that domain instead. It must start with https://.',
    ].join('\n'),
  );
  process.exit(1);
}

execSync('npm run build', { stdio: 'inherit' });
execSync('npx wrangler deploy', { stdio: 'inherit' });
