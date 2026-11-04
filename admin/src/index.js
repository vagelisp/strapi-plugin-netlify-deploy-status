import { Cloud } from '@strapi/icons';
import pluginId from './pluginId';
import './styles.css';

export default {
  register(app) {
    app.registerPlugin({
      id: pluginId,
      name: 'Netlify Deploy Status',
    });

    if (app.widgets?.register) {
      app.widgets.register({
        id: 'netlify-deploy-status',
        pluginId,
        icon: Cloud,
        title: {
          id: `${pluginId}.widget.title`,
          defaultMessage: 'Netlify frontend',
        },
        component: async () => {
          const { default: Widget } = await import('./components/NetlifyDeployStatusWidget');
          return Widget;
        },
      });
      app.widgets.register({
        id: 'netlify-deploy-stats',
        pluginId,
        icon: Cloud,
        title: {
          id: `${pluginId}.widget.stats.title`,
          defaultMessage: 'Build stats',
        },
        component: async () => {
          const { default: Widget } = await import('./components/NetlifyDeployStatsWidget');
          return Widget;
        },
      });
    }
  },
  bootstrap() {},
  async registerTrads({ locales }) {
    return locales.map((locale) => ({ locale, data: {} }));
  },
};
