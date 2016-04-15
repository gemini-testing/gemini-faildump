'use strict';

var EventEmitter = require('events').EventEmitter,
    FailCollector = require('../../lib/fail-collector'),
    plugin = require('../../lib/plugin');

describe('plugin', function () {
    var sandbox = sinon.sandbox.create();

    beforeEach(function () {
        sandbox.stub(FailCollector.prototype);

        this.gemini = new EventEmitter();
        this.runner = new EventEmitter();
        plugin(this.gemini);
        this.gemini.emit('startRunner', this.runner);
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should add failed test to storage on "err" event', function () {
        this.runner.emit('err');
        assert.called(FailCollector.prototype.addFail);
    });

    it('should add failed test to storage on "retry" event', function () {
        this.runner.emit('retry');
        assert.called(FailCollector.prototype.addFail);
    });

    it('should add failed test to storage on "endTest" event if some diff found', function () {
        this.runner.emit('endTest', { equal: false });
        assert.called(FailCollector.prototype.addFail);
    });

    it('should not add failed test to storage on "endTest" event if no diff found', function () {
        this.runner.emit('endTest', { equal: true });
        assert.notCalled(FailCollector.prototype.addFail);
    });

    it('should collect all fails on "end" event', function () {
        this.runner.emit('end');
        assert.called(FailCollector.prototype.collect);
    });
});
