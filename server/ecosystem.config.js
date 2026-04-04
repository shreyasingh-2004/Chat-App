module.exports = {
  apps: [{
    name: 'chat-app-backend',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      MONGO_URI: 'mongodb://localhost:27017/chatapp',
      JWT_SECRET: 'your-secret-key-change-this',
      CLIENT_URL: 'https://your-frontend-domain.com'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};