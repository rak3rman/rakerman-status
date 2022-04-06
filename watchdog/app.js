/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
Filename : rakerman-status/watchdog/app.js
Desc     : main application file
Author(s): RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/

// Packages and configuration - - - - - - - - - - - - - - - - - - - - - - - - -

// Declare packages
const mongoose = require('mongoose');
const Service = mongoose.models.Service || mongoose.model('Service', mongoose.Schema(require('../models/service.js')));
const Alert = mongoose.models.Alert || mongoose.model('Alert', mongoose.Schema(require('../models/alert.js')));
const moment = require('moment');
const net = require('net');
const pkg = require('./package.json');
const chalk = require('chalk');
const wipe = chalk.white;

// Read environment variables
let mongodb_url = process.env.MONGODB_URL;
if (!mongodb_url || mongodb_url.length === 0)
    throw new Error('You must specify the MongoDB URL via the MONGODB_URL environment variable!');

// End of Packages and configuration - - - - - - - - - - - - - - - - - - - - - -


// Watchdog helpers - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

let last_ping = moment();
let next_ping = moment();

// Name : status.dynamic_ping(bot, config_store)
// Desc : dynamically checks when we should ping servers
// Author(s) : RAk3rman
async function dynamic_ping() {
    // Ping if we need one is scheduled already
    if (moment().isAfter(next_ping)) {
        console.log(wipe(`${chalk.bold.red('Watchdog')}:  [` + moment().format('MM/DD/YY-HH:mm:ss') + `] Pinging all servers, ` + moment().diff(last_ping, "minute") + ` mins since last ping`));
        last_ping = moment();
        await ping_servers();
    }
    // Determine ping urgency
    if ((await Service.find({ active: false })).length > 0) { // If one of the servers is currently down, check every minute
        next_ping = moment(last_ping).add(1, "minute");
    } else if (moment().isAfter(next_ping)) { // Else, check every 5 minutes since we shouldn't expect any issues
        next_ping = moment(last_ping).add(5, "minute");
    }
}

// Name : status.ping_servers(bot, config_store)
// Desc : pings all servers
// Author(s) : RAk3rman
async function ping_servers() {
    let services = await Service.find();
    services.map(service => {
        check_server(service);
    });
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

main().catch(err => console.log(err));

async function main() {
    // Mongoose connect to MongoDB
    await mongoose.connect(mongodb_url);
    // Ping services on startup
    await dynamic_ping();
    // Dynamically ping servers every minute
    setInterval(async () => { await dynamic_ping() }, 60000);
}

// End of Start application - - - - - - - - - - - - - - - - - - - - - - - - - - -