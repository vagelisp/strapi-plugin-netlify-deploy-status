'use strict';

const config = ({ env }) => ({
  netlifyToken: env('NETLIFY_AUTH_TOKEN', ''),
  siteId: env('NETLIFY_SITE_ID', ''),
  siteUrl: env('NETLIFY_SITE_URL', ''),
});
import controllers from './controllers/index.js';
import routes from './routes/index.js';
import services from './services/index.js';

module.exports = {
  config,
  controllers,
  routes,
  services,
};
