# Strapi Netlify Deploy Status

Displays the latest Netlify frontend deploy on the Strapi 5 admin homepage.

## Configuration

Set these environment variables in Strapi:

- `NETLIFY_AUTH_TOKEN`: a Netlify personal access token with read access.
- `NETLIFY_SITE_ID`: the Netlify site ID.
- `NETLIFY_SITE_URL`: optional public frontend URL.

The token is used only by the Strapi server and is never sent to the admin browser.
