'use strict';

var _ = require('lodash'),
    inherit = require('inherit'),
    fs = require('q-io/fs'),
    looksSame = require('looks-same'),
    os = require('os'),
    Q = require('q');

module.exports = inherit({

    __constructor: function (config) {
        var runsCount = {};
        config.getBrowserIds().forEach(function (browserId) {
            runsCount[browserId] = 1 + (config.forBrowser(browserId).retry || 0);
        });
        this.runsCount = runsCount;
        this.fails = {};
        this.saveImagePromises = [];
        this.removeImagePromises = [];
    },

    IMAGE_DIFF_FOUND: 'image diff found',

    _generateFilePath: function (sessionId) {
        return os.tmpdir() + [sessionId, new Date().getTime(), 'png'].join('.');
    },

    _composeFail: function (data) {
        return {
            message: data.message || this.IMAGE_DIFF_FOUND,
            browserId: data.browserId,
            sessionId: data.sessionId,
            name: _.compact([
                data.suite.fullName,
                data.state && data.state.name || '',
                data.browserId
            ]).join('.'),
            imagePath: this._generateFilePath(data.sessionId)
        };
    },

    saveFail: function (data) {
        var fail = this._composeFail(data);

        this.saveImagePromises.push(data.image
            ? data.image.save(fail.imagePath)
            : data.saveDiffTo(fail.imagePath));

        if (!this.fails[fail.name]) {
            this.fails[fail.name] = [];
        }
        this.fails[fail.name].push(fail);
    },

    findSameDiffs: function () {
        var _this = this,
            comparisons = [];

        _.forEach(this.fails, function (failList, testName) {
            var firstFail = failList[0],
                runs = _this.runsCount[firstFail.browserId];

            if (failList.length === runs && failList[0].message === _this.IMAGE_DIFF_FOUND) {
                for (var i = 0; i < failList.length; i++) {
                    var anotherFail = failList[i];
                    if (firstFail.message === anotherFail.message
                        && firstFail.imagePath
                        && anotherFail.imagePath) {
                        var promise = Q.nfcall(looksSame, firstFail.imagePath, anotherFail.imagePath, {ignoreCaret: true})
                            .then(function (equal) {
                                if (equal) {
                                    return testName;
                                }
                            })
                            .catch(function (error) {
                                console.log(error);
                            });
                        comparisons.push(promise);
                    }
                }
            }
        });

        return comparisons;
    },

    countSameDiffs: function (sameDiffs) {
        var count = {};

        _.compact(sameDiffs).forEach(function (diff) {
            count[diff] = count[diff] && count[diff] + 1 || 1;
        });

        return count;
    },

    removeSameDiffs: function (sameDiffCount) {
        var _this = this;

        _.forEach(sameDiffCount, function (count, testName) {
            if (_this.fails[testName] && _this.runsCount[_this.fails[testName][0].browserId] === count) {
                _this.fails[testName].forEach(function (fail) {
                    fail.imagePath && _this.removeImagePromises.push(fs.remove(fail.imagePath));
                });
                delete _this.fails[testName];
            }
        });
    },

    convertImagesToBase64: function () {
        var _this = this;

        _.forEach(this.fails, function (failList) {
            _.forEach(failList, function (fail) {
                if (fail.imagePath) {
                    var promise = fs.read(fail.imagePath, 'b')
                        .then(function (content) {
                            fail.imageBase64 = content.toString('base64');
                            return fail.imagePath;
                        })
                        .then(fs.remove)
                        .catch(function (error) {
                            console.log(error);
                        });
                    _this.removeImagePromises.push(promise);
                }
            });
        });

        return this.removeImagePromises;
    },

    cleanUtilityInformation: function () {
        return _.mapValues(this.fails, function (failList) {
            return failList.map(function (fail) {
                return _.omit(fail, ['name', 'imagePath']);
            });
        });
    },

    saveToFile: function (data) {
        return fs.write('faildump.json', JSON.stringify(data));
    },

    get imagesToSave() {
        return this.saveImagePromises;
    }
});
