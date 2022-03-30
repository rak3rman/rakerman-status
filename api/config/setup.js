/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
Filename : rakerman-fallback/config/setup.js
Desc     : checks and sets up configuration values
           in config.json using data-store
Author(s): RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/

// Packages
const chalk = require('chalk');
const wipe = chalk.white;
const moment = require('moment');

// Name : setup.check_values()
// Desc : checks all config.json values and configures each value if invalid
// Author(s) : RAk3rman
exports.check_values = function (config_store) {
    console.log(wipe(`${chalk.bold.cyan('API Setup')}:   [` + moment().format('MM/DD/YY-HH:mm:ss') + `] Checking configuration values`));
    let invalid_config = false;
    // Config value: webserver_port | the port where the webserver will listen for requests
    if (!config_store.has('webserver_port') || config_store.get('webserver_port') === '') {
        config_store.set('webserver_port', 3000);
        console.log(wipe(`${chalk.bold.cyan('API Setup')}:   [` + moment().format('MM/DD/YY-HH:mm:ss') + `] "webserver_port" value in config.json set to default: "3000"`));
    }
    // Config value: discord_bot_token
    if (!config_store.has('discord_bot_token') || config_store.get('discord_bot_token') === '') {
        config_store.set('discord_bot_token', '');
        console.log(wipe(`${chalk.bold.cyan('API Setup')}:   [` + moment().format('MM/DD/YY-HH:mm:ss') + `] Please set "discord_bot_token" value in config.json`));
        invalid_config = true;
    }
    // Config value: discord_bot_channel
    if (!config_store.has('discord_bot_channel') || config_store.get('discord_bot_channel') === '') {
        config_store.set('discord_bot_channel', '');
        console.log(wipe(`${chalk.bold.cyan('API Setup')}:   [` + moment().format('MM/DD/YY-HH:mm:ss') + `] Please set "discord_bot_channel" value in config.json`));
        invalid_config = true;
    }
    // Exit if the config values are not set properly
    if (invalid_config) {
        console.log(wipe(`${chalk.bold.cyan('API Setup')}:   [` + moment().format('MM/DD/YY-HH:mm:ss') + `] Please check "config.json" and configure the appropriate values`));
        config_store.save();
        process.exit(0);
    } else {
        console.log(wipe(`${chalk.bold.cyan('API Setup')}:   [` + moment().format('MM/DD/YY-HH:mm:ss') + `] Configuration values have been propagated`));
    }
}
