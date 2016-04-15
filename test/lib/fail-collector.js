'use strict';

var q = require('q'),
    fs = require('q-io/fs'),

    FailCollector = require('../../lib/fail-collector'),
    BaseError = require('../../lib/errors/base-error'),
    ImageError = require('../../lib/errors/image-error'),
    imageProcessor = require('../../lib/image-processor'),

    utils = require('./utils'),
    mkErrorStub = utils.mkErrorStub,
    mkDiffErrorStub = utils.mkDiffErrorStub,
    mkStateErrorStub = utils.mkStateErrorStub,
    mkConfigStub = utils.mkConfigStub;

describe('fail-collector', function () {
    var sandbox = sinon.sandbox.create();

    beforeEach(function () {
        sandbox.stub(imageProcessor);
        imageProcessor.pngToBase64.returns(q());
        sandbox.stub(fs);
    });

    afterEach(function () {
        sandbox.restore();
    });

    function getFinalErrorData_() {
        return JSON.parse(fs.write.lastCall.args[1]);
    }

    it('should sort errors by failed test name', function () {
        var config = mkConfigStub(),
            failCollector = new FailCollector(config),
            errorData = mkErrorStub({
                suite: { fullName: 'suite-fullname' },
                state: { name: 'state-name' },
                browserId: 'browserId'
            }),
            anotherErrorData = mkErrorStub({
                suite: { fullName: 'another-suite' },
                state: { name: 'another-state' },
                browserId: 'another-browser'
            });
        failCollector.addFail(errorData);
        failCollector.addFail(anotherErrorData);

        return failCollector.collect()
            .then(function () {
                var resultData = getFinalErrorData_();
                assert.property(resultData, 'suite-fullname.state-name.browserId');
                assert.property(resultData, 'another-suite.another-state.another-browser');
            });
    });

    describe('data filtering', function () {
        var config, failCollector;

        beforeEach(function () {
            config = mkConfigStub({ retry: 1 });
            failCollector = new FailCollector(config);
        });

        it('should include failed test to report if test was passed after retry', function () {
            var errorData = mkDiffErrorStub();
            failCollector.addFail(errorData);

            return failCollector.collect()
                .then(function () {
                    var resultData = getFinalErrorData_();
                    assert.property(resultData, 'suite-fullname.state-name.browserId');
                });
        });

        it('should include failed test to report if images are not the same', function () {
            var errorData = mkDiffErrorStub();
            failCollector.addFail(errorData);
            failCollector.addFail(errorData);
            imageProcessor.compare.returns(q(false));

            return failCollector.collect()
                .then(function () {
                    var resultData = getFinalErrorData_();
                    assert.property(resultData, 'suite-fullname.state-name.browserId');
                });
        });

        it('should include failed test to report if error types are different', function () {
            var diffErrorData = mkDiffErrorStub(),
                stateErrorData = mkStateErrorStub();
            failCollector.addFail(diffErrorData);
            failCollector.addFail(stateErrorData);

            return failCollector.collect()
                .then(function () {
                    var resultData = getFinalErrorData_();
                    assert.property(resultData, 'suite-fullname.state-name.browserId');
                });
        });

        it('should not include to report tests that was failed all the time with the same diff error', function () {
            var errorData = mkDiffErrorStub();
            failCollector.addFail(errorData);
            failCollector.addFail(errorData);
            imageProcessor.compare.returns(q(true));

            return failCollector.collect()
                .then(function () {
                    var resultData = getFinalErrorData_();
                    assert.notProperty(resultData, 'suite-fullname.state-name.browserId');
                });
        });
    });

    it('should add to report formatted data', function () {
        var config = mkConfigStub(),
            failCollector = new FailCollector(config),
            errorData = mkErrorStub({
                suite: { fullName: 'suite-fullname' },
                state: { name: 'state-name' },
                browserId: 'browserId',
                equal: false,
                saveDiffTo: sinon.stub().returns(q())
            });
        sandbox.stub(ImageError.prototype, 'getData').returns({ some: 'value' });

        failCollector.addFail(errorData);

        return failCollector.collect()
            .then(function () {
                var resultData = getFinalErrorData_();
                assert.deepEqual(resultData, {
                    'suite-fullname.state-name.browserId': [{ some: 'value' }]
                });
            });
    });

    it('should write formatted error data to the "faildump.json"', function () {
        var config = mkConfigStub(),
            failCollector = new FailCollector(config),
            errorData = mkErrorStub({
                suite: { fullName: 'suite-fullname' },
                state: { name: 'state-name' },
                browserId: 'browserId'
            });
        sandbox.stub(BaseError.prototype, 'getData').returns({ some: 'value' });

        failCollector.addFail(errorData);

        return failCollector.collect()
            .then(function () {
                assert.calledWith(fs.write,
                    'faildump.json',
                    '{"suite-fullname.state-name.browserId":[{"some":"value"}]}'
                );
            });
    });
});
