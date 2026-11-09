// Build, then deploy the static assets to Cloudflare Workers. The origin that
// ends up in canonical links comes from SITE_URL, defaulting to
// https://modplayjs.org (see astro.config.mjs); set SITE_URL for a staging
// deploy. Configuration lives in wrangler.jsonc.
import { execSync } from 'node:child_process';

execSync('npm run build', { stdio: 'inherit' });
execSync('npx wrangler deploy', { stdio: 'inherit' });
