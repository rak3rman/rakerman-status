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

// Print header to console
console.clear();
console.log(chalk.blue.bold('\nRAkerman Status v' + pkg.version + ((process.argv[2] !== undefined) ? ' | ' + process.argv[2].toUpperCase() : "" )));
console.log(chalk.white('--> Contributors: ' + pkg.author));
console.log(chalk.white('--> Description: ' + pkg.description));
console.log(chalk.white('--> Github: ' + pkg.homepage + '\n'));

// Check configuration values
let setup = require('./config/setup.js');
setup.check_values(config_store);

// Declare services
let status = require('./status.js');
status.import_services(raw_services);

// Discord bot
const bot = new eris.Client(config_store.get('discord_bot_token'));
let send_startup_msg = true;

// When the bot is connected and ready, update console
bot.on('ready', async () => {
    // Set bot status
    bot.editStatus("online");
    // Send update to console
    console.log(wipe(`${chalk.bold.blue('API Discord')}: [` + moment().format('MM/DD/YY-HH:mm:ss') + `] Bot is now connected to Discord API`));
    // Send connected bot message
    if (send_startup_msg) {
        await bot.createMessage(config_store.get('discord_bot_channel'), "**RAkerman Fallback v" + pkg.version + ": Service Online**");
        send_startup_msg = false;
    }
});

// Every time a message is created in the Discord server
bot.on('messageCreate', async (msg) => {
    // Only respond to message if in correct channel
    if (msg.channel.id === config_store.get('discord_bot_channel')) {
        // Split message into components
        let parts = msg.content.split(' ');
        // Determine if we received a command
        if (parts[0] === "raf") {
            if (parts[1] === "alert") { // Update alert data
                // Validate command input
                if ((parts[2] === "maintain" || parts[2] === "interrupt") && moment.unix(parseInt(parts[3])).isAfter(moment().subtract(6, "hours")) && parseInt(parts[4]) > -1) {
                    // Update options
                    alert_store.set("tag", nanoid(6));
                    alert_store.set("type", parts[2]);
                    alert_store.set("start", moment.unix(parseInt(parts[3])));
                    alert_store.set("end", moment.unix(parseInt(parts[3])).add(parseInt(parts[4]), "hours"));
                    await bot.createMessage(config_store.get('discord_bot_channel'), "**RAkerman Fallback v" + pkg.version + ": Updated Alert**\n`" + parts[2] + "` `" + moment(alert_store.get("start")).format("MM/DD/YY-HH:mm") + "` to `" + moment(alert_store.get("end")).format("MM/DD/YY-HH:mm") + "`");
                    console.log(wipe(`${chalk.bold.blue('API Discord')}: [` + moment().format('MM/DD/YY-HH:mm:ss') + `] Updated alert status (` + parts[2] + `, ` + moment(alert_store.get("start")).format("MM/DD/YY-HH:mm") + ` to ` + moment(alert_store.get("end")).format("MM/DD/YY-HH:mm") + `)`));
                    return;
                }
            } else if (parts[1] === "maintain") { // Update alert data
                // Validate command input
                if (status.update_service_maintain(parts[2], parts[3] === "true")) {
                    // Update options
                    await bot.createMessage(config_store.get('discord_bot_channel'), ":**RAkerman Fallback v" + pkg.version + ": Updated Maintain Status**\n`" + parts[2] + "` is now `" + (parts[3] === "true") + "`");
                    console.log(wipe(`${chalk.bold.blue('API Discord')}: [` + moment().format('MM/DD/YY-HH:mm:ss') + `] Updated maintain status (` + parts[2] + `, ` + (parts[3] === "true") + `)`));
                    return;
                }
            }
            await bot.createMessage(config_store.get('discord_bot_channel'), "**RAkerman Fallback v" + pkg.version + "**\n> raf alert <desc (maintain, interrupt)> <unix_timestamp> <duration_in_hrs>\n> raf maintain <alias> <status (true, false)>");
            console.log(wipe(`${chalk.bold.blue('API Discord')}: [` + moment().format('MM/DD/YY-HH:mm:ss') + `] User sent invalid command`));
        }
        // Else, do nothing and ignore message
    }
});

// Handle any errors that the bot encounters
bot.on('error', err => {
    console.warn(err);
});

// End of Packages and configuration - - - - - - - - - - - - - - - - - - - - - -

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
            "      document.getElementById(\"raf_alert_time\").innerHTML = raf_sd.toLocaleString('en-us', { month: 'short' }) + \" \" + raf_sd.getDay() + (raf_sd.getDay() > 0 ? ['th', 'st', 'nd', 'rd'][(raf_sd.getDay() > 3 && raf_sd.getDay() < 21) || raf_sd.getDay() % 10 > 3 ? 0 : raf_sd.getDay() % 10] : '') + \", \" + formatAMPM(raf_sd) + \"-\" + formatAMPM(raf_ed)\n" +
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


// Setup external connections - - - - - - - - - - - - - - - - - - - - - - - - -

// Connect discord bot
bot.connect().then(r => {  setTimeout(function () { status.ping_servers(bot, config_store) }, 1000); });
// Dynamically ping servers every minute
setInterval(function () { status.dynamic_ping(false, bot, config_store) }, 60000);

// End of Setup external connections - - - - - - - - - - - - - - - - - - - - - -

module.exports = app;
