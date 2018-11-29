'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

const ImageError = require('../../../lib/errors/image-error');
const BaseError = require('../../../lib/errors/base-error');
const imageProcessor = require('../../../lib/image-processor');
const tempFS = require('../../../lib/temp-fs');

const utils = require('../utils');
const mkStateErrorStub = utils.mkStateErrorStub;
const mkDiffErrorStub = utils.mkDiffErrorStub;

describe('errors/image-error', () => {
    const sandbox = sinon.sandbox.create();
    let config;

    beforeEach(() => {
        config = utils.mkConfigStub();
        sandbox.stub(imageProcessor, 'pngToBase64').resolves();
    });

    afterEach(() => sandbox.restore());

    it('should be instance of BaseError', () => {
        const failedTestError = mkStateErrorStub();

        const failedTest = new ImageError(failedTestError, config, {});

        assert.instanceOf(failedTest, BaseError);
    });

    it('should mark test error as Diff type if it has an "equal" key', () => {
        const failedTestError = mkDiffErrorStub({equal: false});

        const failedTest = new ImageError(failedTestError, config, {});

        assert.ok(failedTest.isDiff);
    });

    it('should create ImageError instance with saveImg method', () => {
        const failedTestError = mkDiffErrorStub();

        const failedTest = new ImageError(failedTestError, config, {});

        return failedTest.saveImg()
            .then(() => assert.calledOnce(failedTestError.saveDiffTo));
    });

    it('should generate temporary image path for ImageError instance', () => {
        sandbox.stub(tempFS, 'resolveImagePath').returns('tempPath');
        const failedTestError = mkDiffErrorStub();

        const failedTest = new ImageError(failedTestError, config, {});

        return assert.equal(failedTest.imagePath, 'tempPath');
    });

    describe('getData', () => {
        const mkImgErrorData_ = (opts) => {
            opts = _.defaults(opts || {}, {
                data: mkDiffErrorStub(),
                config,
                light: false
            });

            return Promise.resolve(new ImageError(opts.data, opts.config, {
                path: opts.data.path,
                saveImg: opts.saveImg,
                light: opts.light
            }).getData());
        };

        it('should return extended data with "base64" key', () => {
            imageProcessor.pngToBase64.resolves('base64-value');

            return mkImgErrorData_({light: false})
                .then((error) => assert.equal(error.base64, 'base64-value'));
        });

        it('should convert image to base64 by default', () => {
            return mkImgErrorData_()
                .then(() => assert.calledOnce(imageProcessor.pngToBase64));
        });

        it('should not convert image to base64 if "light" option exists', () => {
            return mkImgErrorData_({light: true})
                .then(() => assert.notCalled(imageProcessor.pngToBase64));
        });

        it('should call parent method "getData"', () => {
            sandbox.stub(BaseError.prototype, 'getData');

            return mkImgErrorData_()
                .then(() => assert.calledOnce(BaseError.prototype.getData));
        });

        it('should use "img.path" for converting failed image to base64', () => {
            return mkImgErrorData_({data: mkStateErrorStub({img: {path: '/path/test'}})})
                .then(() => assert.calledWith(imageProcessor.pngToBase64, '/path/test'));
        });
    });
});
