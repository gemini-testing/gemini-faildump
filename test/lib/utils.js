'use strict';

var _ = require('lodash'),
    q = require('q');

var errorDefaults = {
        suite: {fullName: 'suite-fullname'},
        state: {name: 'state-name'},
        browserId: 'browserId'
    };

module.exports = {
    mkErrorStub: function(opts) {
        opts = opts || {};
        return _.defaults(opts, errorDefaults);
    },

    mkConfigStub: function(opts) {
        opts = opts || {};
        var defaults = {
            getBrowserIds: sinon.stub().returns([opts.browserId || 'default-browser']),
            forBrowser: function(id) {
                return {
                    id: opts.browserId || 'default-browser',
                    retry: opts.retry || 0,
                    gridUrl: opts.gridUrl || 'grid.url',
                    desiredCapabilities: {}
                };
            }
        }
        return _.defaults(opts, defaults);
    },

    mkStateErrorStub: function() {
        return _.defaults({
            name: 'StateError',
            imagePath: '/some/path/to/image'
        }, errorDefaults);
    },

    mkDiffErrorStub: function() {
        return _.defaults({
            equal: false,
            saveDiffTo: sinon.stub().returns(q())
        }, errorDefaults);
    }
};
