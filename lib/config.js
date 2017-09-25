'use strict';

const configParser = require('gemini-configparser');

const root = configParser.root;
const section = configParser.section;
const option = configParser.option;

const ENV_PREFIX = 'gemini_faildump_';

const is = (type, name) => {
    return (value) => {
        if (typeof value !== type) {
            throw new Error(`"${name}" must be a ${type}`);
        }
    };
};

const getParser = () => {
    return root(section({
        enabled: option({
            defaultValue: true,
            parseEnv: JSON.parse,
            validate: is('boolean', 'enabled')
        }),
        light: option({
            defaultValue: false,
            parseEnv: JSON.parse,
            validate: is('boolean', 'light')
        })
    }), {envPrefix: ENV_PREFIX});
};

module.exports = (options) => {
    const env = process.env;

    return getParser()({options, env, argv: []});
};
