'use strict';

const q = require('q');
const fs = require('q-io/fs');

const FailCollector = require('../../lib/fail-collector');
const BaseError = require('../../lib/errors/base-error');
const ImageError = require('../../lib/errors/image-error');
const imageProcessor = require('../../lib/image-processor');
const tempFS = require('../../lib/temp-fs');

const utils = require('./utils');
const mkErrorStub = utils.mkErrorStub;
const mkDiffErrorStub = utils.mkDiffErrorStub;
const mkStateErrorStub = utils.mkStateErrorStub;
const mkConfigStub = utils.mkConfigStub;

describe('fail-collector', () => {
    const sandbox = sinon.sandbox.create();

    beforeEach(() => {
        sandbox.stub(imageProcessor);
        imageProcessor.pngToBase64.returns(q());
        sandbox.stub(fs);
    });

    afterEach(() => sandbox.restore());

    const getFinalErrorData_ = () => JSON.parse(fs.write.lastCall.args[1]);

    it('should sort errors by failed test name', () => {
        const config = mkConfigStub();
        const failCollector = new FailCollector(config);

        const errorData = mkErrorStub({
            state: {fullName: 'suite-fullname state-name'},
            browserId: 'browserId'
        });
        const anotherErrorData = mkErrorStub({
            state: {fullName: 'another-suite another-state'},
            browserId: 'another-browser'
        });

        failCollector.addFail(errorData);
        failCollector.addFail(anotherErrorData);

        return failCollector.collect()
            .then(() => {
                const resultData = getFinalErrorData_();
                assert.property(resultData, 'suite-fullname state-name.browserId');
                assert.property(resultData, 'another-suite another-state.another-browser');
            });
    });

    describe('data filtering', () => {
        let config;
        let failCollector;

        beforeEach(() => {
            config = mkConfigStub({retry: 1});
            failCollector = new FailCollector(config);
            fs.exists.returns(q.resolve(true));
        });

        it('should save screenshots for failed tests', () => {
            const errorData = mkDiffErrorStub();

            failCollector.addFail(errorData);
            failCollector.addFail(errorData);

            sandbox.stub(ImageError.prototype, 'save').returns(q.resolve());

            return failCollector.collect()
                .then(() => assert.calledTwice(ImageError.prototype.save));
        });

        it('should compare failed tests screenshots', () => {
            const errorData = mkDiffErrorStub();
            sandbox.stub(tempFS, 'resolveImagePath')
                .onFirstCall().returns('/reference/path')
                .onSecondCall().returns('/temp/path');

            failCollector.addFail(errorData);
            failCollector.addFail(errorData);

            return failCollector.collect()
                .then(() => assert.calledWith(imageProcessor.compare, '/reference/path', '/temp/path'));
        });

        it('should include failed test to report if test was passed after retry', () => {
            const errorData = mkDiffErrorStub({
                state: {fullName: 'suite-fullname state-name'},
                browserId: 'browserId'
            });
            failCollector.addFail(errorData);

            return failCollector.collect()
                .then(() => {
                    const resultData = getFinalErrorData_();
                    assert.property(resultData, 'suite-fullname state-name.browserId');
                });
        });

        it('should include failed test to report if images are not the same', () => {
            const errorData = mkDiffErrorStub({
                state: {fullName: 'suite-fullname state-name'},
                browserId: 'browserId'
            });
            imageProcessor.compare.returns(q(false));

            failCollector.addFail(errorData);
            failCollector.addFail(errorData);

            return failCollector.collect()
                .then(() => assert.property(getFinalErrorData_(), 'suite-fullname state-name.browserId'));
        });

        it('should include failed test to report if error types are different', () => {
            const diffErrorData = mkDiffErrorStub({
                state: {fullName: 'suite-fullname state-name'},
                browserId: 'browserId'
            });
            const stateErrorData = mkStateErrorStub({
                state: {fullName: 'suite-fullname state-name'},
                browserId: 'browserId'
            });

            failCollector.addFail(diffErrorData);
            failCollector.addFail(stateErrorData);

            return failCollector.collect()
                .then(() => {
                    const resultData = getFinalErrorData_();
                    assert.property(resultData, 'suite-fullname state-name.browserId');
                });
        });

        it('should not include to report tests that was failed all the time with the same diff error', () => {
            const errorData = mkDiffErrorStub({
                state: {fullName: 'suite-fullname state-name'},
                browserId: 'browserId'
            });
            imageProcessor.compare.returns(q(true));

            failCollector.addFail(errorData);
            failCollector.addFail(errorData);

            return failCollector.collect()
                .then(() => {
                    const resultData = getFinalErrorData_();
                    assert.notProperty(resultData, 'suite-fullname.state-name.browserId');
                });
        });
    });

    it('should add to report formatted data', () => {
        const config = mkConfigStub({retry: 1});
        const failCollector = new FailCollector(config);
        const errorData = mkErrorStub({
            state: {fullName: 'suite-fullname state-name'},
            browserId: 'browserId',
            equal: false,
            saveDiffTo: sinon.stub().returns(q())
        });

        imageProcessor.compare.returns(q(false));
        sandbox.stub(ImageError.prototype, 'getData')
            .onFirstCall().returns({some: 'value1'})
            .onSecondCall().returns({another: 'value2'});

        failCollector.addFail(errorData);
        failCollector.addFail(errorData);

        return failCollector.collect()
            .then(() => {
                const resultData = getFinalErrorData_();
                assert.deepEqual(resultData, {
                    'suite-fullname state-name.browserId': [{some: 'value1'}, {another: 'value2'}]
                });
            });
    });

    it('should write formatted error data to the "faildump.json"', () => {
        const config = mkConfigStub();
        const failCollector = new FailCollector(config);
        const errorData = mkErrorStub({
            state: {fullName: 'suite-fullname state-name'},
            browserId: 'browserId'
        });
        sandbox.stub(BaseError.prototype, 'getData').returns({some: 'value'});

        failCollector.addFail(errorData);

        return failCollector.collect()
            .then(() => {
                assert.calledWith(fs.write,
                    'faildump.json',
                    '{"suite-fullname state-name.browserId":[{"some":"value"}]}'
                );
            });
    });
});
