module.exports = {
  apps: [
    {
      name: 'rakerman-watchdog',
      script: './app.js',
      env: {
        MONGODB_URL: "mongodb://localhost:27017/rakerman-status"
      }
    }
  ]
}
