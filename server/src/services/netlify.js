const getConfig = (strapi) => strapi.config.get('plugin::netlify-deploy-status', {});

const normalizeDeploy = (deploy) => ({
  id: deploy.id,
  state: deploy.state,
  context: deploy.context,
  branch: deploy.branch,
  commit: deploy.commit_ref,
  commitUrl: deploy.commit_url,
  deployUrl: deploy.deploy_ssl_url || deploy.deploy_url,
  createdAt: deploy.created_at,
  updatedAt: deploy.updated_at,
  publishedAt: deploy.published_at,
  errorMessage: deploy.error_message,
});

export default ({ strapi }) => ({
  async getStatus() {
    const { netlifyToken, siteId, siteUrl } = getConfig(strapi);

    if (!netlifyToken || !siteId) {
      return {
        configured: false,
        siteUrl: siteUrl || null,
        message: 'Configure NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID.',
      };
    }

    const response = await fetch(
      `https://api.netlify.com/api/v1/sites/${encodeURIComponent(siteId)}/deploys?per_page=1`,
      {
        headers: {
          Authorization: `Bearer ${netlifyToken}`,
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      const details = await response.text();
      strapi.log.error(`Netlify status request failed (${response.status}): ${details}`);
      return {
        configured: true,
        siteUrl: siteUrl || null,
        error: 'Netlify status is currently unavailable.',
      };
    }

    const deploys = await response.json();
    const latest = Array.isArray(deploys) ? deploys[0] : null;

    return {
      configured: true,
      siteUrl: siteUrl || null,
      deploy: latest ? normalizeDeploy(latest) : null,
    };
  },
});
