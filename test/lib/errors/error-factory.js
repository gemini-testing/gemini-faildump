'use strict';

const errorFactory = require('../../../lib/errors/error-factory');
const ImageError = require('../../../lib/errors/image-error');
const BaseError = require('../../../lib/errors/base-error');

const utils = require('../utils');
const mkErrorStub = utils.mkErrorStub;
const mkStateErrorStub = utils.mkStateErrorStub;
const mkDiffErrorStub = utils.mkDiffErrorStub;

describe('error factory', () => {
    let config;

    beforeEach(() => {
        config = utils.mkConfigStub();
    });

    it('should return instance of BaseError by default', () => {
        const failedTestError = mkErrorStub();

        const failedTest = errorFactory.buildError(failedTestError, config);

        return assert.instanceOf(failedTest, BaseError);
    });

    describe('ImageError', () => {
        const sandbox = sinon.sandbox.create();

        afterEach(() => sandbox.restore());

        it('should create ImageError instance for state errors', () => {
            const failedTestError = mkStateErrorStub();

            const failedTest = errorFactory.buildError(failedTestError, config, {});

            return assert.instanceOf(failedTest, ImageError);
        });

        it('should not create ImageError instance if it is impossible to save image', () => {
            const failedTestError = mkErrorStub({name: 'StateError'}); // without image

            const failedTest = errorFactory.buildError(failedTestError, config, {});

            return assert.notInstanceOf(failedTest, ImageError);
        });

        it('should create ImageError instance for diff errors', () => {
            const failedTestError = mkDiffErrorStub();

            const failedTest = errorFactory.buildError(failedTestError, config, {});

            return assert.instanceOf(failedTest, ImageError);
        });

        it('should pass "light" option to ImageError instance', () => {
            const failedTestError = mkDiffErrorStub();

            const failedTest = errorFactory.buildError(failedTestError, config, {light: true});

            return assert.equal(failedTest.light, true);
        });
    });
});
