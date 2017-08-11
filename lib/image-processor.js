'use strict';

const Promise = require('bluebird');
const looksSame = Promise.promisify(require('looks-same'));
const fs = require('fs-extra');

module.exports = {
    compare: (path1, path2) => {
        return looksSame(path1, path2, {ignoreCaret: true})
            .catch((error) => console.error(error.stack || error));
    },

    pngToBase64: (path) => {
        return fs.readFile(path)
            .then((content) => content.toString('base64'))
            .catch((error) => console.error(error.stack || error));
    }
};
