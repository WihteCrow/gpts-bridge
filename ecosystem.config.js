module.exports = {
  apps: [
    {
      name: 'gpts-bridge',
      script: './dist/main.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
