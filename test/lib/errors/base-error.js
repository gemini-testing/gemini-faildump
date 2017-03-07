'use strict';

const BaseError = require('../../../lib/errors/base-error');
const utils = require('../utils');
const mkErrorStub = utils.mkErrorStub;
const mkConfigStub = utils.mkConfigStub;

describe('errors/base-error', () => {
    it('should generate "name" property for error data', () => {
        const failedTestError = mkErrorStub({
            suite: {
                fullName: 'suite-fullname'
            },
            state: {
                name: 'state-name'
            },
            browserId: 'browserId'
        });
        const config = mkConfigStub();

        const failedTest = new BaseError(failedTestError, config);

        assert.equal(failedTest.name, 'suite-fullname.state-name.browserId');
    });

    it('should get quota from gridUrl param', () => {
        const failedTestError = mkErrorStub();
        const config = mkConfigStub({gridUrl: 'http://quotaName:quotaPass@grid.url'});
        const failedTest = new BaseError(failedTestError, config);

        const errorData = failedTest.getData();

        assert.equal(errorData.seleniumQuota, 'quotaName');
    });

    describe('getData', () => {
        [
            'timestamp', 'message', 'sessionId', 'browserCapabilities', 'seleniumQuota'
        ].forEach((key) => {
            it(`should return object with ${key} value`, () => {
                const failedTestError = mkErrorStub();
                const config = mkConfigStub();
                const failedTest = new BaseError(failedTestError, config);

                const errorData = failedTest.getData();

                assert.property(errorData, key);
            });
        });
    });
});
