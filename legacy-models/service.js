/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
Filename : rakerman-status/models/service.js
Desc     : mongoose model for a service
Author(s): RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/

// Schema declaration
module.exports = {
    alias: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    port: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    last_down: {
        type: Date,
        default: Date.now
    },
    last_up: {
        type: Date,
        default: Date.now
    },
    subscribers: [{
        type: String
    }],
    active: {
        type: Boolean,
        default: false
    },
    maintain: {
        type: Boolean,
        default: false
    }
};