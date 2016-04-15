'use strict';

var BaseError = require('../../../lib/errors/base-error'),
    utils = require('../utils'),
    mkErrorStub = utils.mkErrorStub,
    mkConfigStub = utils.mkConfigStub;

describe('errors/base-error', function () {
    it('should generate "name" property for error data', function () {
        var failedTestError = mkErrorStub({
                suite: {
                    fullName: 'suite-fullname'
                },
                state: {
                    name: 'state-name'
                },
                browserId: 'browserId'
            }),
            config = mkConfigStub();

        var failedTest = new BaseError(failedTestError, config);

        assert.equal(failedTest.name, 'suite-fullname.state-name.browserId');
    });

    it('should get quota from gridUrl param', function () {
        var failedTestError = mkErrorStub(),
            config = mkConfigStub({ gridUrl: 'http://quotaName:quotaPass@grid.url' }),
            failedTest = new BaseError(failedTestError, config);

        var errorData = failedTest.getData();

        assert.equal(errorData.seleniumQuota, 'quotaName');
    });

    describe('getData()', function () {
        ['timestamp', 'message', 'sessionId', 'browserCapabilities', 'seleniumQuota'].forEach(function (key) {
            it('should return object with ' + key + ' value', function () {
                var failedTestError = mkErrorStub(),
                    config = mkConfigStub(),
                    failedTest = new BaseError(failedTestError, config);

                var errorData = failedTest.getData();

                assert.property(errorData, key);
            });
        });
    });
});
