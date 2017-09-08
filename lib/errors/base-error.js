'use strict';

const _ = require('lodash');
const URI = require('urijs');

module.exports = class BaseError {
    constructor(data, config) {
        const browserConfig = config.forBrowser(data.browserId);
        this._browserCapabilities = browserConfig.desiredCapabilities;
        this._quota = new URI(browserConfig.gridUrl).username();
        this._timestamp = new Date();

        this.message = data.message || 'Image diff found'; // diff Error don't have "message" key;
        this.browserId = data.browserId;
        this.sessionId = data.sessionId;
        this.name = _.compact([
            data.state.fullName,
            data.browserId
        ]).join('.');
    }

    getData() {
        return {
            timestamp: this._timestamp,
            message: this.message,
            sessionId: this.sessionId,
            browserCapabilities: this._browserCapabilities,
            seleniumQuota: this._quota
        };
    }
};
