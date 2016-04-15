'use strict';

var FailCollector = require('./fail-collector');

module.exports = function (gemini, opts) {
    gemini.on('startRunner', function (runner) {
        var fails = new FailCollector(gemini.config, opts);

        runner.on('err', fails.addFail.bind(fails));

        runner.on('retry', fails.addFail.bind(fails));

        runner.on('endTest', function (data) {
            if (!data.equal) {
                fails.addFail(data);
            }
        });

        runner.on('end', fails.collect.bind(fails));
    });
};
