'use strict';

var q = require('q'),
    temp = require('temp'),
    ImageError = require('../../../lib/errors/image-error'),
    BaseError = require('../../../lib/errors/base-error'),
    utils = require('../utils'),
    mkErrorStub = require('../utils').mkErrorStub;

describe('errors/image-error', function() {
    var config;

    beforeEach(function() {
        config = utils.mkConfigStub();
    });

    it('should be instance of BaseError', function() {
        var failedTestError = mkErrorStub();

        var failedTest = new ImageError(failedTestError, config, {});

        assert.instanceOf(failedTest, BaseError);
    });

    it('should mark test error as Diff type if it has an "equal" key', function() {
        var failedTestError = mkErrorStub({equal: false});

        var failedTest = new ImageError(failedTestError, config, {});

        assert.ok(failedTest.isDiff);
    });

    describe('getData()', function() {
        it('should return extended data with "base64" key', function() {
            var failedTestError = mkErrorStub();

            var failedTest = new ImageError(failedTestError, config, {base64: 'base64-value'}),
                errorData = failedTest.getData();

            assert.equal(errorData.base64, 'base64-value');
        });
    });
});
