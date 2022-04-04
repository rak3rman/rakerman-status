/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
Filename : rakerman-fallback/app.js
Desc     : main application file
Author(s): RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/

// Packages and configuration - - - - - - - - - - - - - - - - - - - - - - - - -

// Declare packages
const app = require('express')();
module.exports = { path: '/api', handler: app }
const path = require('path');
const dataStore = require('data-store');
const config_store = new dataStore({path: './api/config/config.json'});
const alert_store = new dataStore({path: './api/config/alert.json'});
const pkg = require('./package.json');
const raw_services = require('./config/services.json');
const chalk = require('chalk');
const { nanoid } = require('nanoid');
const moment = require('moment');
const eris = require('eris');
const wipe = chalk.white;

// Fastify and main functions - - - - - - - - - - - - - - - - - - - - - - - - - -

// GET : Status for all services
app.get('/api/status/all', async function (req, res) {
    // If we are getting hits on a fallback site, we might want to queue a server check
    status.dynamic_ping(true, bot, config_store);
    // Return view for home page
    res.header("Access-Control-Allow-Origin", "*"); // Allow anyone to request this site, cookies are not logged
    res.send(status.get_payload(bot, config_store));
    console.log(wipe(`${chalk.bold.magenta('API Fastify')}: [` + moment().format('MM/DD/YY-HH:mm:ss') + `] GET /api/status/all`));
})

// RAF Alert
app.get('/api/alert', async function (req, res) {
    // Construct payload base case
    let payload = "";
    // Check if we should send payload
    if (moment(alert_store.get("start")).diff(moment(), "hours") < 12 && moment().isBefore(alert_store.get("end"))) {
        payload = "let raf_alert_tag = \"" + alert_store.get("tag") + "\";\n" +
            "window.onload = function() {\n" +
            "  let raf_sd = new Date(\"" + alert_store.get("start") + "\");\n" +
            "  let raf_ed = new Date(\"" + alert_store.get("end") + "\");\n" +
            "  function formatAMPM(date) {\n" +
            "    let hours = date.getHours();\n" +
            "    let ampm = hours >= 12 ? 'pm' : 'am';\n" +
            "    hours = hours % 12;\n" +
            "    hours = hours ? hours : 12;\n" +
            "    return hours + ampm;\n" +
            "  }\n" +
            "  (function () {\n" +
            "    if (!window.localStorage.getItem('raf_alert_' + raf_alert_tag)) {\n" +
            "      document.getElementById(\"raf_alert_title\").innerHTML = \"" + (alert_store.get("type") === "interrupt" ? "Service Interruption" : "Site Maintenance") + "\";\n" +
            "      document.getElementById(\"raf_alert_desc\").innerHTML = \"" + (alert_store.get("type") === "interrupt" ? "Expect minor interruptions on select services" : "Expect extended downtime on all services") + "\";\n" +
            "      document.getElementById(\"raf_alert_time\").innerHTML = raf_sd.toLocaleString('en-us', { month: 'short' }) + \" \" + raf_sd.getDate() + (raf_sd.getDate() > 0 ? ['th', 'st', 'nd', 'rd'][(raf_sd.getDate() > 3 && raf_sd.getDate() < 21) || raf_sd.getDate() % 10 > 3 ? 0 : raf_sd.getDate() % 10] : '') + \", \" + formatAMPM(raf_sd) + \"-\" + formatAMPM(raf_ed)\n" +
            "      document.getElementById(\"raf_alert_banner\").className = \"bg-" + (alert_store.get("type") === "interrupt" ? "yellow" : "red") + "-500\";\n" +
            "      document.getElementById(\"raf_alert_icon\").className = \"flex p-2 rounded-lg bg-" + (alert_store.get("type") === "interrupt" ? "yellow" : "red") + "-600\";\n" +
            "      document.getElementById(\"raf_alert_hide\").className = \"-mr-1 flex p-2 rounded-md hover:bg-" + (alert_store.get("type") === "interrupt" ? "yellow" : "red") + "-600 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2 bg-transparent bg-none border-none\";\n" +
            "    }\n" +
            "  })();\n" +
            "};" +
            "function hide_raf_alert() {\n" +
            "  window.localStorage.setItem('raf_alert_' + raf_alert_tag, true);\n" +
            "  document.getElementById(\"raf_alert_banner\").className = \"hidden\";\n" +
            "}\n";
    }
    res.header("Access-Control-Allow-Origin", "*"); // Allow anyone to request this site, cookies are not logged
    res.type('.js');
    res.send(payload);
    console.log(wipe(`${chalk.bold.magenta('API Fastify')}: [` + moment().format('MM/DD/YY-HH:mm:ss') + `] GET /api/alert`));
})

// End of Fastify and main functions - - - - - - - - - - - - - - - - - - - - - -

module.exports = app;
