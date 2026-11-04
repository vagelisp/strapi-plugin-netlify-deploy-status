# Strapi Netlify Deploy Status

A Strapi 5 admin dashboard plugin that gives content editors a simple view of the Netlify frontend deployment status without requiring access to the Netlify dashboard.

It adds two homepage widgets:

- **Netlify frontend** — the latest deploy state, branch/context, commit, build time, timestamps, error details, and links to the deployed preview and commit.
- **Build stats** — recent success rate, average build duration, active builds, and a visual comparison of recent build durations.

Both widgets refresh manually on demand. While a deploy is queued, building, or processing, they refresh automatically every 15 seconds and stop polling when the deploy finishes or fails.

## Requirements

- Strapi 5.13 or newer, before Strapi 6
- Node.js supported by your Strapi application
- A Netlify personal access token with permission to read site deploys
- The Netlify site ID for the frontend

## Installation

Install the plugin in the Strapi application:

```bash
npm install strapi-plugin-netlify-deploy-status
```

Then rebuild the Strapi admin panel and restart Strapi:

```bash
npm run build
npm run develop
```

The plugin is enabled automatically after installation. It appears on the Strapi admin homepage as two dashboard widgets.

## Configuration

Set these environment variables in the Strapi application environment:

```dotenv
NETLIFY_AUTH_TOKEN=your_netlify_personal_access_token
NETLIFY_SITE_ID=your_netlify_site_id
NETLIFY_SITE_URL=https://www.example.com
```

`NETLIFY_SITE_URL` is optional. It adds an **Open frontend** link to the widgets.

The plugin reads the variables through Strapi's plugin configuration. The token remains on the Strapi server and is never sent to the admin browser.

For a programmatic configuration, the equivalent `config/plugins.js` entry is:

```js
module.exports = ({ env }) => ({
  'netlify-deploy-status': {
    enabled: true,
    config: {
      netlifyToken: env('NETLIFY_AUTH_TOKEN', ''),
      siteId: env('NETLIFY_SITE_ID', ''),
      siteUrl: env('NETLIFY_SITE_URL', ''),
    },
  },
});
```

Do not commit the token to source control. Use your hosting provider's encrypted environment variables in production.

## Netlify token and site ID

Create a personal access token from Netlify's user settings. A read-only token is sufficient because this plugin only requests deploy information.

The site ID is available in Netlify under the site's project configuration, or through the Netlify CLI:

```bash
netlify status
```

If either `NETLIFY_AUTH_TOKEN` or `NETLIFY_SITE_ID` is missing, the widgets display a configuration message instead of failing Strapi startup.

## What the plugin requests

The Strapi server calls Netlify's deploys endpoint:

```text
GET https://api.netlify.com/api/v1/sites/{site_id}/deploys?per_page=10
```

The admin panel calls the plugin's authenticated Strapi admin route:

```text
GET /netlify-deploy-status/status
```

The response contains the latest normalized deploy, up to ten recent deploys, and summary statistics. No Netlify credential is exposed to the browser.

## Development

Clone the repository, install dependencies, and build the plugin:

```bash
git clone https://github.com/vagelisp/strapi-plugin-netlify-deploy-status.git
cd strapi-plugin-netlify-deploy-status
npm install
npm run build
npm run verify
```

For local development, link or copy the plugin into the Strapi application's `plugins/netlify-deploy-status` directory and add a local plugin resolve entry in `config/plugins.js`.

Before publishing a release, run:

```bash
npm run build
npm run verify
npm pack --dry-run
```

## Troubleshooting

### The widgets say that Netlify is unavailable

Check the Strapi server logs and confirm that:

1. `NETLIFY_AUTH_TOKEN` is valid and has not expired.
2. `NETLIFY_SITE_ID` belongs to the intended Netlify site.
3. The Strapi server can make outbound HTTPS requests to `api.netlify.com`.

### The widgets do not appear

Rebuild the Strapi admin after installing or updating the plugin:

```bash
npm run build
```

Then sign out and back in to the Strapi admin panel, or clear the browser cache if the old admin bundle is still loaded.

### Why do build logs not appear?

The widgets show deploy metadata and error messages returned by Netlify's deploys API. Netlify's detailed live build log is not part of this endpoint, so the plugin links to the deploy and commit where available rather than trying to proxy the full log through Strapi.

## License

MIT
