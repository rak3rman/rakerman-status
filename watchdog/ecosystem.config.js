module.exports = {
  apps: [
    {
      name: 'rakerman-watchdog',
      script: './app.js',
      env: {
        BOT_TOKEN: "",
        BOT_CHANNEL: "",
        MONGODB_URL: "mongodb://localhost:27017/rakerman-status"
      }
    }
  ]
}
