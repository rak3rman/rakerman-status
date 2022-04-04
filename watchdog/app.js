/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
Filename : rakerman-status/watchdog/app.js
Desc     : main application file
Author(s): RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/

// Packages and configuration - - - - - - - - - - - - - - - - - - - - - - - - -

// Declare packages
const eris = require('eris');
const mongoose = require('mongoose');
const moment = require('moment');
const pkg = require('./package.json');
const chalk = require('chalk');
const wipe = chalk.white;

// Read environment variables
let bot_token = process.env.BOT_TOKEN;
if (!bot_token || bot_token.length === 0)
    throw new Error('You must specify the Discord Bot Token via the BOT_TOKEN environment variable!');

let bot_channel = process.env.BOT_CHANNEL;
if (!bot_channel || bot_channel.length === 0)
    throw new Error('You must specify the Discord Bot Channel via the BOT_CHANNEL environment variable!');

let mongodb_url = process.env.MONGODB_URL;
if (!mongodb_url || mongodb_url.length === 0)
    throw new Error('You must specify the MongoDB URL via the MONGODB_URL environment variable!');

// Discord bot
const bot = new eris.Client(bot_token);
let send_startup_msg = true;

// End of Packages and configuration - - - - - - - - - - - - - - - - - - - - - -


// Mongoose setup - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const serviceSchema = new mongoose.Schema({
    alias: {type: String, required: true},
    url: {type: String, required: true},
    port: {type: Number, required: true},
    location: {type: String, required: true},
    last_down: {type: Date, default: Date.now()},
    last_up: {type: Date, default: Date.now()},
    active: {type: Boolean, default: false},
    maintain: {type: Boolean, default: false}
})

const Service = mongoose.model('Service', serviceSchema);

// End of Mongoose setup - - - - - - - - - - - - - - - - - - - - - - - - - - - -


// Eris Discord bot - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// When the bot is connected and ready, update console
bot.on('ready', async () => {
    // Set bot status
    bot.editStatus("online");
    // Send connected bot message
    if (send_startup_msg) {
        await bot.createMessage(bot_channel, "**RAkerman Watchdog v" + pkg.version + ": Service Online**");
        send_startup_msg = false;
    }
});

// Every time a message is created in the Discord server
bot.on('messageCreate', async (msg) => {
    // Only respond to message if in correct channel
    if (msg.channel.id === bot_channel) {
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
                    await bot.createMessage(bot_channel, "**RAkerman Watchdog v" + pkg.version + ": Updated Alert**\n`" + parts[2] + "` `" + moment(alert_store.get("start")).format("MM/DD/YY-HH:mm") + "` to `" + moment(alert_store.get("end")).format("MM/DD/YY-HH:mm") + "`");
                }
            } else if (parts[1] === "maintain") { // Mark maintenance status for service
                // Validate command input
                let service = await Service.find({alias: parts[2]});
                if (service.length > 0) {
                    // Update options
                    service.maintain = parts[3] === "true";
                    service.save();
                    await bot.createMessage(bot_channel, ":**RAkerman Watchdog v" + pkg.version + ": Updated Maintain Status**\n`" + parts[2] + "` is now `" + (parts[3] === "true") + "`");
                }
            } else {
                await bot.createMessage(bot_channel, "**RAkerman Watchdog v" + pkg.version + "**\n> raf alert <desc (maintain, interrupt)> <unix_timestamp> <duration_in_hrs>\n> raf maintain <alias> <status (true, false)>");
            }
        }
        // Else, do nothing and ignore message
    }
});

// Handle any errors that the bot encounters
bot.on('error', err => {
    console.warn(err);
});

// End of Eris Discord bot - - - - - - - - - - - - - - - - - - - - - - - - - - -


// Watchdog helpers - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

let last_ping = moment();
let next_ping = moment();

// Name : status.dynamic_ping(bot, config_store)
// Desc : dynamically checks when we should ping servers
// Author(s) : RAk3rman
async function dynamic_ping() {
    // Ping if we need one is scheduled already
    if (moment().isAfter(next_ping)) {
        console.log(wipe(`${chalk.bold.red('Watchdog')}:  [` + moment().format('MM/DD/YY-HH:mm:ss') + `] Pinging all servers on ` + moment().diff(last_ping, "minute") + ` min interval`));
        last_ping = moment();
        await ping_servers();
    }
    // Determine ping urgency
    if (await Service.find({ active: false }).length > 0) { // If one of the servers is currently down, check every minute
        next_ping = moment(last_ping).add(1, "minute");
    } else if (moment(last_ping).diff(next_ping, "minute") > 5 || moment().isAfter(next_ping)) { // Else, check every 5 minutes since we shouldn't expect any issues
        next_ping = moment(last_ping).add(4, "hour");
    }
}

// Name : status.ping_servers(bot, config_store)
// Desc : pings all servers
// Author(s) : RAk3rman
async function ping_servers() {
    let services = await Service.find();
    services.map(service => {
        check_server(service);
    })
}

// Name : status.check_server(alias, bot, config_store)
// Desc : checks the status of an individual server
// Author(s) : RAk3rman
async function check_server(service) {
    // Create a new socket and set the timeout
    let sock = new net.Socket();
    sock.setTimeout(2500);
    // Set cases for sock connection
    sock.on('connect', async function() { // Valid connection, service is up
        if (!service.active) {
            // Log that we just connected
            await bot.createMessage(bot_channel, "**" + service.alias + "** just came online");
            console.log(wipe(`${chalk.bold.red('Watchdog')}:  [` + moment().format('MM/DD/YY-HH:mm:ss') + `] ` + service.alias + ` just came online`));
        }
        // Update serv object to reflect status
        service.active = true;
        service.last_up = moment();
        await service.save();
        // Destroy socket
        sock.destroy();
    }).on('error', async function(e) { // Connection error, service is down
        if (service.active) {
            // Log that we encountered an error
            await bot.createMessage(bot_channel, "**" + service.alias + "** just went offline via error");
            console.log(wipe(`${chalk.bold.red('Watchdog')}:  [` + moment().format('MM/DD/YY-HH:mm:ss') + `] ` + service.alias + ` just went offline via error`));
        } else {
            console.log(wipe(`${chalk.bold.red('Watchdog')}:  [` + moment().format('MM/DD/YY-HH:mm:ss') + `] ` + service.alias + ` is still down: error`));
        }
        // Update serv object to reflect status
        service.active = false;
        service.last_down = moment();
        await service.save();
    }).on('timeout', async function(e) { // Timeout, service is down
        if (service.active) {
            // Log that we encountered an error
            await bot.createMessage(bot_channel, "**" + service.alias + "** just went offline via timeout");
            console.log(wipe(`${chalk.bold.red('Watchdog')}:  [` + moment().format('MM/DD/YY-HH:mm:ss') + `] ` + service.alias + ` just went offline via timeout`));
        } else {
            console.log(wipe(`${chalk.bold.red('Watchdog')}:  [` + moment().format('MM/DD/YY-HH:mm:ss') + `] ` + service.alias + ` is still down: timeout`));
        }
        // Update serv object to reflect status
        service.active = false;
        service.last_down = moment();
        await service.save();
    }).connect(service.port, service.url);
}

// End of Watchdog helpers - - - - - - - - - - - - - - - - - - - - - - - - - - -


// Start application - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Mongoose connect to MongoDB
await mongoose.connect(mongodb_url);
// Connect discord bot
bot.connect().then(r => {  setTimeout(async () => { await ping_servers() }, 1000); });
// Dynamically ping servers every minute
setInterval(async () => { await dynamic_ping() }, 60000);

// End of Start application - - - - - - - - - - - - - - - - - - - - - - - - - - -