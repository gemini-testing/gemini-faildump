'use strict';

var _ = require('lodash'),
    URI = require('urijs');

function BaseError(data, config) {
    var browserConfig = config.forBrowser(data.browserId);
    this._browserCapabilities = browserConfig.desiredCapabilities;
    this._quota = new URI(browserConfig.gridUrl).username();
    this._timestamp = new Date();

    this.message = data.message || 'Image diff found'; // diff Error don't have "message" key;
    this.browserId = data.browserId;
    this.sessionId = data.sessionId;
    this.name = _.compact([
        data.suite.fullName,
        data.state && data.state.name,
        data.browserId
    ]).join('.');
}

BaseError.prototype.getData = function () {
    return {
        timestamp: this._timestamp,
        message: this.message,
        sessionId: this.sessionId,
        browserCapabilities: this._browserCapabilities,
        seleniumQuota: this._quota
    };
};

module.exports = BaseError;
