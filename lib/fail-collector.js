'use strict';

const _ = require('lodash');
const fs = require('q-io/fs');
const q = require('q');

const errorFactory = require('./errors/error-factory');
const imageProcessor = require('./image-processor');

module.exports = class FailCollector {
    constructor(config, opts) {
        this._config = config;
        this._options = opts || {};
        this.fails = [];
    }

    addFail(fail) {
        this.fails.push(q.resolve(errorFactory.buildError(fail, this._config, this._options)));
    }

    collect() {
        return q.all(this.fails)
            .then((fails) => _.groupBy(fails, 'name'))
            .then((fails) => this._filterDiffs(fails))
            .then((fails) => this._getFailsData(fails))
            .then((fails) => this._saveToFile(fails))
            .catch((error) => console.error(`Error occurred while collecting fails: ${error.stack}`));
    }

    _filterDiffs(fails) {
        return this._getRealFailedTests(fails)
            .then((realFails) => _.omit(fails, realFails));
    }

    _getRealFailedTests(errors) {
        return _(errors)
            .map((fails) => {
                return fails.length === this._maxRuns(fails[0].browserId)
                    && _.every(fails, {isDiff: true})
                    && getRealFailedTestName_(fails);
            })
            .thru(q.all).value()
            .then(_.compact);

        function getRealFailedTestName_(fails) {
            return _(fails)
                // remove the comparison of the first diff with yourself
                .slice(1)
                .map(compareWith_(fails[0]))
                .thru(q.all).value()
                .then((compares) => _.every(compares) && fails[0].name);
        }

        function compareWith_(reference) {
            const promise = reference.save();

            return (fail) => promise
                .then(fail.save())
                .then(() => imageProcessor.compare(reference.imagePath, fail.imagePath));
        }
    }

    _maxRuns(browserId) {
        return this._config.forBrowser(browserId).retry + 1;
    }

    _getFailsData(fails) {
        const keys = _.keys(fails);

        return _(fails)
            .map((failList) => _(failList)
                .map((fail) => fail.getData())
                .thru(q.all)
                .value())
            .thru(q.all)
            .value()
            .then((res) => _.zipObject(keys, res));
    }

    _saveToFile(errors) {
        return fs.write('faildump.json', JSON.stringify(errors));
    }
};
