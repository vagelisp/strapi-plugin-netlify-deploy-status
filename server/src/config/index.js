'use strict';

module.exports = ({ env }) => ({
  netlifyToken: env('NETLIFY_AUTH_TOKEN', ''),
  siteId: env('NETLIFY_SITE_ID', ''),
  siteUrl: env('NETLIFY_SITE_URL', ''),
});
