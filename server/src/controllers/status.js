export default ({ strapi }) => ({
  async getStatus(ctx) {
    const result = await strapi
      .plugin('netlify-deploy-status')
      .service('netlify')
      .getStatus();

    ctx.body = result;
  },
});
