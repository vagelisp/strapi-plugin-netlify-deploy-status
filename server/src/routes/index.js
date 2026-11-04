export default {
  admin: {
    type: 'admin',
    routes: [
      {
        method: 'GET',
        path: '/status',
        handler: 'status.getStatus',
        config: {},
      },
    ],
  },
};
