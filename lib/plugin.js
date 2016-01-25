'use strict';

var Q = require('q'),
    FailCollection = require('./fail-collection');

module.exports = function (gemini, options) {
    gemini.on('startRunner', function (runner) {
        var fails = new FailCollection(gemini.config);

        runner.on('err', function (data) {
            fails.saveFail(data);
        });

        runner.on('retry', function (data) {
            fails.saveFail(data);
        });

        runner.on('endTest', function (data) {
            if (data.equal !== true) {
                fails.saveFail(data);
            }
        });

        runner.on('end', function () {
            return Q.all(fails.imagesToSave)
                .then(fails.findSameDiffs.bind(fails))
                .then(Q.all)
                .then(fails.countSameDiffs)
                .then(fails.removeSameDiffs.bind(fails))
                .then(fails.convertImagesToBase64.bind(fails))
                .then(Q.all)
                .then(fails.cleanUtilityInformation.bind(fails))
                .then(fails.saveToFile)
                .catch(function (error) {
                    console.log(error);
                })
                .done();
        });
    });
};
