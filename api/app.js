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
    console.log(wipe(`${chalk.bold.blue('Discord')}: [` + moment().format('MM/DD/YY-HH:mm:ss') + `] Bot is now connected to Discord API`));
    // Send connected bot message
    if (send_startup_msg) {
        await bot.createMessage(config_store.get('discord_bot_channel'), ":white_check_mark: **RAkerman Fallback v" + pkg.version + ": Service Online**");
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
                if ((parts[2] === "maintenance" || parts[2] === "interrupt") && moment.unix(parseInt(parts[3])).isAfter(moment().subtract(6, "hours")) && parseInt(parts[4]) > -1) {
                    // Update options
                    alert_store.set("tag", nanoid(6));
                    alert_store.set("type", parts[2]);
                    alert_store.set("start", moment.unix(parseInt(parts[3])));
                    alert_store.set("end", moment.unix(parseInt(parts[3])).add(parseInt(parts[4]), "hours"));
                    await bot.createMessage(config_store.get('discord_bot_channel'), ":white_check_mark: **RAkerman Fallback v" + pkg.version + ": Updated Alert**\n`" + parts[2] + "` `" + moment(alert_store.get("start")).format("MM/DD/YY-HH:mm") + "` to `" + moment(alert_store.get("end")).format("MM/DD/YY-HH:mm") + "`");
                    console.log(wipe(`${chalk.bold.blue('Discord')}: [` + moment().format('MM/DD/YY-HH:mm:ss') + `] Updated alert status (` + parts[2] + `, ` + moment(alert_store.get("start")).format("MM/DD/YY-HH:mm") + ` to ` + moment(alert_store.get("end")).format("MM/DD/YY-HH:mm") + `)`));
                    return;
                }
            }
            await bot.createMessage(config_store.get('discord_bot_channel'), ":grey_question: **RAkerman Fallback v" + pkg.version + ": Invalid Command**\n> raf alert <desc (maintenance, interrupt)> <unix_timestamp> <duration_in_hrs>");
            console.log(wipe(`${chalk.bold.blue('Discord')}: [` + moment().format('MM/DD/YY-HH:mm:ss') + `] User sent invalid command`));
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
    console.log(wipe(`${chalk.bold.magenta('Fastify')}: [` + moment().format('MM/DD/YY-HH:mm:ss') + `] GET /api/status/all`));
})

// RAF Alert
app.get('/api/alert', async function (req, res) {
    // Return alert payload
    let payload = {
        tag: "",
        type: "",
        start: "",
        end: ""
    }
    if (moment(alert_store.get("start")).diff(moment(), "hours") < 12 && moment().isBefore(alert_store.get("end"))) {
        payload = {
            tag: alert_store.get("tag"),
            type: alert_store.get("type"),
            start: alert_store.get("start"),
            end: alert_store.get("end")
        }
    }
    res.header("Access-Control-Allow-Origin", "*"); // Allow anyone to request this site, cookies are not logged
    res.send(payload);
    console.log(wipe(`${chalk.bold.magenta('Fastify')}: [` + moment().format('MM/DD/YY-HH:mm:ss') + `] GET /api/alert`));
})

// End of Fastify and main functions - - - - - - - - - - - - - - - - - - - - - -


// Setup external connections - - - - - - - - - - - - - - - - - - - - - - - - -

// // Start webserver using config values
// console.log(wipe(`${chalk.bold.magenta('Fastify')}: [` + moment().format('MM/DD/YY-HH:mm:ss') + `] Attempting to start http webserver on port ` + config_store.get('webserver_port')));
// app.listen(config_store.get('webserver_port'), function (err) {
//     if (err) {
//         console.log(err);
//         process.exit(1)
//     }
//     console.log(wipe(`${chalk.bold.magenta('Fastify')}: [` + moment().format('MM/DD/YY-HH:mm:ss') + `] Running http webserver on port ` + config_store.get('webserver_port')));
//     // Connect discord bot
//     bot.connect().then(r => {  setTimeout(function () { status.ping_servers(bot, config_store) }, 1000); });
//     // Dynamically ping servers every minute
//     setInterval(function () { status.dynamic_ping(false, bot, config_store) }, 60000);
// })

// End of Setup external connections - - - - - - - - - - - - - - - - - - - - - -

module.exports = app;
