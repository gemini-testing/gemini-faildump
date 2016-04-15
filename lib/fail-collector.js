'use strict';

var _ = require('lodash'),
    inherit = require('inherit'),
    fs = require('q-io/fs'),
    q = require('q'),

    errorFactory = require('./errors/error-factory'),
    imageProcessor = require('./image-processor');

module.exports = inherit({
    __constructor: function (config, opts) {
        this._config = config;
        this._options = opts || {};
        this.fails = [];
    },

    addFail: function (fail) {
        this.fails.push(errorFactory.buildError(fail, this._config, this._options));
    },

    collect: function () {
        return q.all(this.fails)
            .then(function (fails) {
                return _.groupBy(fails, 'name');
            })
            .then(this._filterDiffs.bind(this))
            .then(this._getFailsData.bind(this))
            .then(this._saveToFile.bind(this))
            .catch(function (error) {
                console.error('Some error while collecting fails: ', error.stack);
            });
    },

    _filterDiffs: function (fails) {
        return this._getRealFailedTests(fails)
            .then(function (realFails) {
                return _.omit(fails, realFails);
            });
    },

    _getRealFailedTests: function (errors) {
        return _(errors)
            .map(function (fails) {
                return fails.length === this._maxRuns(fails[0].browserId) &&
                    _.every(fails, { isDiff: true }) &&
                    getRealFailedTestName_(fails);
            }.bind(this))
            .thru(q.all).value()
            .then(_.compact);

        function getRealFailedTestName_(fails) {
            return _(fails)
                .map(compareWith_(fails[0]))
                .thru(q.all).value()
                .then(function (compares) {
                    return _.every(compares) && fails[0].name;
                });
        }

        function compareWith_(reference) {
            return function (fail) {
                return imageProcessor.compare(reference.imagePath, fail.imagePath);
            };
        }
    },

    _maxRuns: function (browserId) {
        return this._config.forBrowser(browserId).retry + 1;
    },

    _getFailsData: function (fails) {
        return _.mapValues(fails, function (failList) {
            return failList.map(function (fail) {
                return fail.getData();
            });
        });
    },

    _saveToFile: function (errors) {
        return fs.write('faildump.json', JSON.stringify(errors));
    }
});
