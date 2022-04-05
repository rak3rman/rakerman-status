/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
Filename : rakerman-status/nuxt/api/app.js
Desc     : main application file
Author(s): RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/

// Packages and configuration - - - - - - - - - - - - - - - - - - - - - - - - -

// Declare packages
const app = require('express')();
const mongoose = require('mongoose');
const Service = mongoose.models.Service || mongoose.model('Service', mongoose.Schema(require('../../models/service.js')));
const Alert = mongoose.models.Alert || mongoose.model('Alert', mongoose.Schema(require('../../models/alert.js')));
const moment = require('moment');
const pkg = require('./package.json');
const chalk = require('chalk');
const wipe = chalk.white;

// Read environment variables
let mongodb_url = process.env.MONGODB_URL;
if (!mongodb_url || mongodb_url.length === 0)
  throw new Error('You must specify the MongoDB URL via the MONGODB_URL environment variable!');

// End of Packages and configuration - - - - - - - - - - - - - - - - - - - - - -


// Fastify and main functions - - - - - - - - - - - - - - - - - - - - - - - - - -

// GET : Status for all services
app.get('/api/service/status', async function (req, res) {
  // Get formatted list of services
  let payload = [];
  let services = await Service.find();
  services.map(service => {
    payload.push({
      name: service.alias,
      href: "https://" + service.alias,
      uptime: moment(service.last_down).fromNow(),
      downtime: moment(service.last_up).fromNow(),
      location: service.location,
      active: service.active,
      maintain: service.maintain
    });
  });
  // Send response
  res.header("Access-Control-Allow-Origin", "*"); // Allow anyone to request this site, cookies are not logged
  res.send(payload);
  console.log(wipe(`${chalk.bold.magenta('Status API')}: [` + moment().format('MM/DD/YY-HH:mm:ss') + `] GET /api/service/status`));
})

// RAF Alert
app.get('/api/alert', async function (req, res) {
  // Get alerts that are in the future
  let payload = "";
  let alerts = await Alert.find({ end: { $gte: moment().subtract(12, 'hours'), $lte: moment() } });
  if (alerts.length > 0) {
      payload = "let raf_alert_tag = \"" + alerts[0]._id + "\";\n" +
          "window.onload = function() {\n" +
          "  let raf_sd = new Date(\"" + alerts[0].start + "\");\n" +
          "  let raf_ed = new Date(\"" + alerts[0].end + "\");\n" +
          "  function formatAMPM(date) {\n" +
          "    let hours = date.getHours();\n" +
          "    let ampm = hours >= 12 ? 'pm' : 'am';\n" +
          "    hours = hours % 12;\n" +
          "    hours = hours ? hours : 12;\n" +
          "    return hours + ampm;\n" +
          "  }\n" +
          "  (function () {\n" +
          "    if (!window.localStorage.getItem('raf_alert_' + raf_alert_tag)) {\n" +
          "      document.getElementById(\"raf_alert_title\").innerHTML = \"" + (alerts[0].is_maintain ? "Site Maintenance" : "Service Interruption") + "\";\n" +
          "      document.getElementById(\"raf_alert_desc\").innerHTML = \"" + (alerts[0].is_maintain ? "Expect extended downtime on all services" : "Expect minor interruptions on select services") + "\";\n" +
          "      document.getElementById(\"raf_alert_time\").innerHTML = raf_sd.toLocaleString('en-us', { month: 'short' }) + \" \" + raf_sd.getDate() + (raf_sd.getDate() > 0 ? ['th', 'st', 'nd', 'rd'][(raf_sd.getDate() > 3 && raf_sd.getDate() < 21) || raf_sd.getDate() % 10 > 3 ? 0 : raf_sd.getDate() % 10] : '') + \", \" + formatAMPM(raf_sd) + \"-\" + formatAMPM(raf_ed)\n" +
          "      document.getElementById(\"raf_alert_banner\").className = \"bg-" + (alerts[0].is_maintain ? "red" : "yellow") + "-500\";\n" +
          "      document.getElementById(\"raf_alert_icon\").className = \"flex p-2 rounded-lg bg-" + (alerts[0].is_maintain ? "red" : "yellow") + "-600\";\n" +
          "      document.getElementById(\"raf_alert_hide\").className = \"-mr-1 flex p-2 rounded-md hover:bg-" + (alerts[0].is_maintain ? "red" : "yellow") + "-600 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2 bg-transparent bg-none border-none\";\n" +
          "    }\n" +
          "  })();\n" +
          "};" +
          "function hide_raf_alert() {\n" +
          "  window.localStorage.setItem('raf_alert_' + raf_alert_tag, true);\n" +
          "  document.getElementById(\"raf_alert_banner\").className = \"hidden\";\n" +
          "}\n";
  }
  // Send response
  res.header("Access-Control-Allow-Origin", "*"); // Allow anyone to request this site, cookies are not logged
  res.type('.js');
  res.send(payload);
  console.log(wipe(`${chalk.bold.magenta('Status API')}: [` + moment().format('MM/DD/YY-HH:mm:ss') + `] GET /api/alert`));
})

// End of Fastify and main functions - - - - - - - - - - - - - - - - - - - - - -


// Start application - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

main().catch(err => console.log(err));

async function main() {
  // Mongoose connect to MongoDB
  await mongoose.connect(mongodb_url);
}

// End of Start application - - - - - - - - - - - - - - - - - - - - - - - - - - -

module.exports = app;
