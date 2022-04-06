module.exports = {
  apps: [
    {
      name: 'rakerman-status',
      exec_mode: 'cluster',
      instances: '2',
      script: './node_modules/nuxt/bin/nuxt.js',
      args: 'start',
      env: {
        MONGODB_URL: "mongodb://localhost:27017/rakerman-status",
        API_SECRET: "#"
      }
    }
  ]
}
