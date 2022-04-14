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
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const moment = require('moment');
const net = require('net');
const pkg = require('./package.json');
const chalk = require('chalk');
const wipe = chalk.white;

// Read environment variables
let mongodb_url = process.env.MONGODB_URL;
if (!mongodb_url || mongodb_url.length === 0)
    throw new Error('You must specify the MongoDB URL via the MONGODB_URL environment variable!');

let mg_api_key = process.env.MG_API_KEY;
if (!mg_api_key || mg_api_key.length === 0)
    throw new Error('You must specify the Mailgun API Key via the MG_API_KEY environment variable!');

let mg_domain = process.env.MG_DOMAIN;
if (!mg_domain || mg_domain.length === 0)
    throw new Error('You must specify the Mailgun Domain via the MG_DOMAIN environment variable!');

// Setup Nodemailer
const nodemailerMailgun = nodemailer.createTransport(
    mg({auth: { api_key: mg_api_key, domain: mg_domain }})
);

// End of Packages and configuration - - - - - - - - - - - - - - - - - - - - - -


// Watchdog helpers - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

let last_ping = moment();
let next_ping = moment();

// Name : dynamic_ping()
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

// Name : ping_servers()
// Desc : pings all servers
// Author(s) : RAk3rman
async function ping_servers() {
    let services = await Service.find();
    services.map(service => {
        check_server(service);
    });
}

// Name : check_server(service)
// Desc : checks the status of an individual server
// Author(s) : RAk3rman
async function check_server(service) {
    // Create a new socket and set the timeout
    let sock = new net.Socket();
    sock.setTimeout(2500);
    // Set cases for sock connection
    sock.on('connect', async function() { // Valid connection, service is up
        if (!service.active) {
            service.active = true;
            // Log that we just connected
            console.log(wipe(`${chalk.bold.red('Watchdog')}:  [` + moment().format('MM/DD/YY-HH:mm:ss') + `] ` + service.alias + ` just came online`));
            await send_email(service, "Service Restored", "Service has been restored to the " + service.alias + " service. We'll keep pinging the service every so often and let you know if it goes offline.");
        }
        // Update serv object to reflect status
        service.last_up = moment();
        await service.save();
        // Destroy socket
        sock.destroy();
    }).on('error', async function(e) { // Connection error, service is down
        if (service.active) {
            service.active = false;
            // Log that we encountered an error
            console.log(wipe(`${chalk.bold.red('Watchdog')}:  [` + moment().format('MM/DD/YY-HH:mm:ss') + `] ` + service.alias + ` just went offline via error`));
            await send_email(service, "Went Offline (Error)", "We couldn't reach the " + service.alias + " service (implying that it is down). We'll keep pinging the service every minute until the issue is resolved. Everyone attached to this email has been notified.");
        } else {
            console.log(wipe(`${chalk.bold.red('Watchdog')}:  [` + moment().format('MM/DD/YY-HH:mm:ss') + `] ` + service.alias + ` is still down: error`));
        }
        // Update serv object to reflect status
        service.last_down = moment();
        await service.save();
    }).on('timeout', async function(e) { // Timeout, service is down
        if (service.active) {
            service.active = false;
            // Log that we encountered an error
            console.log(wipe(`${chalk.bold.red('Watchdog')}:  [` + moment().format('MM/DD/YY-HH:mm:ss') + `] ` + service.alias + ` just went offline via timeout`));
            await send_email(service, "Went Offline (Timeout)", "We encountered a timeout error with the " + service.alias + " service (implying that we have a configuration/network issue). We'll keep pinging the service every minute until the issue is resolved. Everyone attached to this email has been notified.");
        } else {
            console.log(wipe(`${chalk.bold.red('Watchdog')}:  [` + moment().format('MM/DD/YY-HH:mm:ss') + `] ` + service.alias + ` is still down: timeout`));
        }
        // Update serv object to reflect status
        service.last_down = moment();
        await service.save();
    }).connect(service.port, service.url);
}

// Name : send_email(alias, bot, config_store)
// Desc : checks the status of an individual server
// Author(s) : RAk3rman
async function send_email(service, reason, desc) {
    let info = await nodemailerMailgun.sendMail({
        from: '"RAkerman Status" <status@rakerman.com>', // sender address
        to: service.subscribers, // list of receivers
        subject: service.alias + ": " + reason, // Subject line
        text: desc, // plain text body
        html: "<p>Hey there,</p>\n" +
            "<br>\n" +
            "<p>" + desc + "</p>\n" +
            "<br>\n" +
            "<p><b>Service Details</b>\n" +
            "<br><code>Alias: <b>" + service.alias + "</b></code>\n" +
            "<br><code>Server URL: <b>" + service.url + "</b></code>\n" +
            "<br><code>Server Port: <b>" + service.port + "</b></code>\n" +
            "<br><code>Location: <b>" + service.location + "</b></code>\n" +
            "<br><code>Last Up: <b>" + moment(service.last_up).format('LLL') + " CST</b></code>\n" +
            "<br><code>Last Down: <b>" + moment(service.last_down).format('LLL') + " CST</b></code>\n" +
            "<br><code>Is Online: <b>" + service.active + "</b></code>\n" +
            "<br><code>Under Maintenance: <b>" + service.maintain + "</b></code></p>\n" +
            "<br>\n" +
            "<p>All the best,\n" +
            "<br>RAkerman Status\n" +
            "<br><a href=\"https://status.rakerman.com\">status.rakerman.com</a></p>", // html body
    });
    console.log(wipe(`${chalk.bold.blue('Nodemailer')}:[` + moment().format('MM/DD/YY-HH:mm:ss') + `] Email update sent to subscribers ` + info.messageId));
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