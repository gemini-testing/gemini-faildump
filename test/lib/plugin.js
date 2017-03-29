'use strict';

const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;
const FailCollector = require('../../lib/fail-collector');
const plugin = require('../../lib/plugin');

describe('plugin', () => {
    const sandbox = sinon.sandbox.create();
    const geminiEvents = {
        END_RUNNER: 'endRunner',
        RETRY: 'retry',
        ERROR: 'err',
        TEST_RESULT: 'testResult'
    };

    beforeEach(() => {
        this.gemini = new EventEmitter();
        this.runner = new EventEmitter();
        sandbox.stub(FailCollector.prototype, 'addFail');
        sandbox.stub(FailCollector.prototype, 'collect');

        plugin(_.extend(this.gemini, {events: geminiEvents}));
    });

    afterEach(() => sandbox.restore());

    it('should add failed test to storage on "ERROR" event', () => {
        this.gemini.emit(geminiEvents.ERROR);

        assert.called(FailCollector.prototype.addFail);
    });

    it('should add failed test to storage on "RETRY" event', () => {
        this.gemini.emit(geminiEvents.RETRY);

        assert.called(FailCollector.prototype.addFail);
    });

    it('should add failed test to storage on "TEST_RESULT" event if some diff found', () => {
        this.gemini.emit(geminiEvents.TEST_RESULT, {equal: false});

        assert.called(FailCollector.prototype.addFail);
    });

    it('should not add failed test to storage on "TEST_RESULT" event if no diff found', () => {
        this.gemini.emit(geminiEvents.TEST_RESULT, {equal: true});

        assert.notCalled(FailCollector.prototype.addFail);
    });

    it('should collect all fails on "END_RUNNER" event', () => {
        this.gemini.emit(geminiEvents.END_RUNNER);

        assert.called(FailCollector.prototype.collect);
    });
});
