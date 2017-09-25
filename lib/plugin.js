'use strict';

const parseConfig = require('./config');
const FailCollector = require('./fail-collector');

module.exports = (gemini, opts) => {
    const config = parseConfig(opts);
    if (!config.enabled) {
        return;
    }

    const fails = new FailCollector(gemini.config, config);

    gemini.on(gemini.events.ERROR, (data) => fails.addFail(data));

    gemini.on(gemini.events.RETRY, (data) => fails.addFail(data));

    gemini.on(gemini.events.TEST_RESULT, (data) => data.equal || fails.addFail(data));

    gemini.on(gemini.events.END_RUNNER, () => fails.collect());
};
