'use strict';

var q = require('q'),
    tempFS = require('../../../lib/temp-fs'),
    errorFactory = require('../../../lib/errors/error-factory'),
    ImageError = require('../../../lib/errors/image-error'),
    BaseError = require('../../../lib/errors/base-error'),
    imageProcessor = require('../../../lib/image-processor'),

    utils = require('../utils'),
    mkErrorStub = utils.mkErrorStub,
    mkStateErrorStub = utils.mkStateErrorStub,
    mkDiffErrorStub = utils.mkDiffErrorStub;

describe('error factory', function() {
    var config;

    beforeEach(function() {
        config = utils.mkConfigStub();
    });

    it('should return instance of BaseError by default', function() {
        var failedTestError = mkErrorStub();

        return errorFactory.buildError(failedTestError, config)
            .then(function(errorData) {
                assert.instanceOf(errorData, BaseError);
            });
    });

    describe('ImageError', function() {
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            sandbox.stub(imageProcessor, 'pngToBase64').returns(q());
        });

        afterEach(function() {
            sandbox.restore();
        });

        it('should create ImageError instance for state errors', function() {
            var failedTestError = mkStateErrorStub();

            return errorFactory.buildError(failedTestError, config, {})
                .then(function(errorData) {
                    assert.instanceOf(errorData, ImageError);
                });
        });

        it('should not create ImageError instance if it is impossible to save image', function() {
            var failedTestError = mkErrorStub({name: 'StateError'}); // without image

            return errorFactory.buildError(failedTestError, config, {})
                .then(function(errorData) {
                    assert.notInstanceOf(errorData, ImageError);
                });
        });

        it('should create ImageError instance for diff errors', function() {
            var failedTestError = mkDiffErrorStub();

            return errorFactory.buildError(failedTestError, config, {})
                .then(function(errorData) {
                    assert.instanceOf(errorData, ImageError);
                });
        });

        it('should save screenshot of the test failed with diff error type', function () {
            var failedTestError = mkDiffErrorStub();

            return errorFactory.buildError(failedTestError, config, {})
                .then(function(errorData) {
                    assert.calledOnce(failedTestError.saveDiffTo);
                });
        });

        it('should convert image to base64 by default', function() {
            var failedTestError = mkDiffErrorStub();

            return errorFactory.buildError(failedTestError, config, {})
                .then(function(errorData) {
                    assert.calledOnce(imageProcessor.pngToBase64);
                });
        });

        it('should not convert image to base64 if "light" option exist', function() {
            var failedTestError = mkDiffErrorStub();

            return errorFactory.buildError(failedTestError, config, {light: true})
                .then(function(errorData) {
                    assert.notCalled(imageProcessor.pngToBase64);
                });
        });

        it('should use imagePath for converting failed image to base64', function () {
            var failedTestError = mkStateErrorStub();

            return errorFactory.buildError(failedTestError, config, {})
                .then(function(errorData) {
                    assert.calledWith(imageProcessor.pngToBase64, failedTestError.imagePath);
                });
        });

        it('should generate temporary path for image', function() {
            sandbox.stub(tempFS, 'resolveImagePath').returns('tempPath');
            var failedTestError = mkDiffErrorStub();

            return errorFactory.buildError(failedTestError, config, {})
                .then(function(errorData) {
                    assert.equal(errorData.imagePath, 'tempPath');
                });
        });
    });
});
