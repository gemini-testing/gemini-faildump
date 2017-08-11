'use strict';

const _ = require('lodash');

const errorDefaults = {
    state: {fullName: 'suite-fullname state-name'},
    browserId: 'browserId'
};

module.exports = {
    mkErrorStub: (opts) => {
        opts = opts || {};

        return _.defaults(opts, errorDefaults);
    },

    mkConfigStub: (opts) => {
        opts = opts || {};
        const defaults = {
            getBrowserIds: sinon.stub().returns([opts.browserId || 'default-browser']),
            forBrowser: () => {
                return {
                    id: opts.browserId || 'default-browser',
                    retry: opts.retry || 0,
                    gridUrl: opts.gridUrl || 'grid.url',
                    desiredCapabilities: {}
                };
            }
        };
        return _.defaults(opts, defaults);
    },

    mkStateErrorStub: (opts) => {
        opts = opts || {};

        return _.defaults(opts, {
            name: 'StateError',
            imagePath: '/some/path/to/image'
        }, errorDefaults);
    },

    mkDiffErrorStub: (opts) => {
        opts = opts || {};

        return _.defaults(opts, {
            equal: false,
            saveDiffTo: sinon.stub().resolves()
        }, errorDefaults);
    }
};
