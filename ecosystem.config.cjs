module.exports = {
  apps: [
    {
      name: 'storage-web',
      cwd: __dirname,
      script: 'node_modules/vite/bin/vite.js',
      args: 'preview --host 0.0.0.0 --port 3011',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3011,
      },
    },
  ],
};
