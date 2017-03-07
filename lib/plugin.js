'use strict';

const FailCollector = require('./fail-collector');

module.exports = (gemini, opts) => {
    const fails = new FailCollector(gemini.config, opts);

    gemini.on(gemini.events.ERROR, (data) => fails.addFail(data));

    gemini.on(gemini.events.RETRY, (data) => fails.addFail(data));

    gemini.on(gemini.events.TEST_RESULT, (data) => data.equal || fails.addFail(data));

    gemini.on(gemini.events.END_RUNNER, () => fails.collect());
};
