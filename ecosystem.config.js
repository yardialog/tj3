module.exports = {
  apps: [
    {
      name: 'teenjob-app',
      script: 'bun',
      args: 'run start',
      cwd: '/var/www/tj3',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
    {
      name: 'teenjob-chat',
      script: 'bun',
      args: '--hot index.ts',
      cwd: '/var/www/tj3/mini-services/chat-service',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
    },
  ],
};
