const getConfig = (strapi) => strapi.config.get('plugin::netlify-deploy-status', {});

const normalizeDeploy = (deploy) => ({
  id: deploy.id,
  state: deploy.state,
  context: deploy.context,
  branch: deploy.branch,
  commit: deploy.commit_ref,
  commitMessage: deploy.title || deploy.commit_message,
  commitUrl: deploy.commit_url,
  deployUrl: deploy.deploy_ssl_url || deploy.deploy_url,
  adminUrl: deploy.admin_url,
  createdAt: deploy.created_at,
  updatedAt: deploy.updated_at,
  publishedAt: deploy.published_at,
  deployTimeSeconds: deploy.deploy_time,
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
      `https://api.netlify.com/api/v1/sites/${encodeURIComponent(siteId)}/deploys?per_page=10`,
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
    const recentDeploys = Array.isArray(deploys) ? deploys.map(normalizeDeploy) : [];
    const completedDeploys = recentDeploys.filter((deploy) => Number.isFinite(deploy.deployTimeSeconds));
    const successfulDeploys = recentDeploys.filter((deploy) => deploy.state === 'ready');
    const activeDeploys = recentDeploys.filter((deploy) => ['building', 'enqueued', 'processing'].includes(deploy.state));
    const failedDeploys = recentDeploys.filter((deploy) => deploy.state === 'error');
    const averageBuildTimeSeconds = completedDeploys.length
      ? Math.round(completedDeploys.reduce((total, deploy) => total + deploy.deployTimeSeconds, 0) / completedDeploys.length)
      : null;

    return {
      configured: true,
      siteUrl: siteUrl || null,
      deploy: recentDeploys[0] || null,
      recentDeploys,
      stats: {
        sampleSize: recentDeploys.length,
        successful: successfulDeploys.length,
        failed: failedDeploys.length,
        active: activeDeploys.length,
        successRate: recentDeploys.length ? Math.round((successfulDeploys.length / recentDeploys.length) * 100) : null,
        averageBuildTimeSeconds,
      },
    };
  },
});
