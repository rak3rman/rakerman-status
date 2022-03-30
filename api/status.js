/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
Filename : rakerman-fallback/services/status.js
Desc     : js helper file to determine status of services
Author(s): RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/

// Variables and services
const moment = require('moment');
const net = require('net');
const chalk = require('chalk');
const wipe = chalk.white;
let status = require('./status.js');

let services = new Map();

let service = class {
    constructor(alias, url, port, location) {
        this.alias = alias;
        this.url = url;
        this.port = port;
        this.location = location;
        this.last_down = moment();
        this.last_up = moment();
        this.active = false;
        this.maintain = false;
    }
}

let last_ping = moment();
let next_ping = moment();

// Name : status.import_services(file)
// Desc : pings all servers
// Author(s) : RAk3rman
exports.import_services = function (file) {
    file.forEach(serv => {
        services.set(serv.alias, new service(
            serv.alias,
            serv.url,
            serv.port,
            serv.location
        ))
    })
}

// Name : status.update_service_maintain(alias, maintain)
// Desc : update maintain value of service
// Author(s) : RAk3rman
exports.update_service_maintain = function (alias, maintain) {
  // Get service object
  let serv = services.get(alias);
  if (!serv) return;
  // Update value
  if (maintain === true || maintain === false) {
    serv.maintain = maintain;
    return true;
  }
  return false;
}

// Name : status.dynamic_ping(bot, config_store)
// Desc : dynamically checks when we should ping servers
// Author(s) : RAk3rman
exports.dynamic_ping = function (is_urgent, bot, config_store) {
    // Ping if we need one is scheduled already
    if (moment().isAfter(next_ping)) {
        console.log(wipe(`${chalk.bold.yellow('API Pinger')}:  [` + moment().format('MM/DD/YY-HH:mm:ss') + `] Pinging all servers on ` + moment().diff(last_ping, "minute") + ` min interval`));
        last_ping = moment();
        status.ping_servers(bot, config_store);
    }
    // Determine ping urgency
    if (Array.from(services, ele => ele[1].active).includes(false)) { // If one of the servers is currently down, check every minute
        next_ping = moment(last_ping).add(1, "minute");
    } else if (is_urgent) { // If the ping is "urgent", check every 5 minutes
        next_ping = moment(last_ping).add(5, "minute");
    } else if (moment(last_ping).diff(next_ping, "minute") > 5 || moment().isAfter(next_ping)) { // Else, check every 4 hours since we shouldn't expect any issues
        next_ping = moment(last_ping).add(4, "hour");
    }
}

// Name : status.ping_servers(bot, config_store)
// Desc : pings all servers
// Author(s) : RAk3rman
exports.ping_servers = function (bot, config_store) {
    services.forEach(serv => {
        check_server(serv.alias, bot, config_store);
    })
}

// Name : status.check_server(alias, bot, config_store)
// Desc : checks the status of an individual server
// Author(s) : RAk3rman
function check_server(alias, bot, config_store) {
    // Create a new socket and set the timeout
    let sock = new net.Socket();
    sock.setTimeout(2500);
    // Get service object
    let serv = services.get(alias);
    if (!serv) return;
    // Set cases for sock connection
    sock.on('connect', function() { // Valid connection, service is up
        if (serv.active) {
            // Log that we just connected
            bot.createMessage(config_store.get('discord_bot_channel'), "@everyone :white_check_mark: <" + alias + "> just came online");
            console.log(wipe(`${chalk.bold.yellow('API Pinger')}:  [` + moment().format('MM/DD/YY-HH:mm:ss') + `] ` + alias + ` just came online`));
        }
        // Update serv object to reflect status
        serv.active = true;
        serv.last_up = moment();
        // Destroy socket
        sock.destroy();
    }).on('error', function(e) { // Connection error, service is down
        if (serv.active) {
            // Log that we encountered an error
            bot.createMessage(config_store.get('discord_bot_channel'), "@everyone :warning: <" + alias + "> just went offline via error");
            console.log(wipe(`${chalk.bold.yellow('API Pinger')}:  [` + moment().format('MM/DD/YY-HH:mm:ss') + `] ` + alias + ` just went offline via error`));
        } else {
            console.log(wipe(`${chalk.bold.yellow('API Pinger')}:  [` + moment().format('MM/DD/YY-HH:mm:ss') + `] ` + alias + ` is down: error`));
        }
        // Update serv object to reflect status
        serv.active = false;
        serv.last_down = moment();
    }).on('timeout', function(e) { // Timeout, service is down
        if (serv.active) {
            // Log that we encountered an error
            bot.createMessage(config_store.get('discord_bot_channel'), "@everyone :warning: <" + alias + "> just went offline via timeout");
            console.log(wipe(`${chalk.bold.yellow('API Pinger')}:  [` + moment().format('MM/DD/YY-HH:mm:ss') + `] ` + alias + ` just went offline via timeout`));
        } else {
            console.log(wipe(`${chalk.bold.yellow('API Pinger')}:  [` + moment().format('MM/DD/YY-HH:mm:ss') + `] ` + alias + ` is down: timeout`));
        }
        // Update serv object to reflect status
        serv.active = false;
        serv.last_down = moment();
    }).connect(serv.port, serv.url);
}

// Name : status.get_payload()
// Desc : gets the payload for the front-end at status.rakerman.com
// Author(s) : RAk3rman
exports.get_payload = function () {
    // Build payload from services map
    let payload = [];
    services.forEach((value, key) => {
        payload.push({
            name: key,
            href: "https://" + key,
            uptime: moment(value.last_down).fromNow(),
            downtime: moment(value.last_up).fromNow(),
            location: value.location,
            active: value.active,
            maintain: value.maintain
        })
    })
    return payload;
}
