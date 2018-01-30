'use strict';

const temp = require('temp');
let tempDir;

temp.track();

exports.resolveImagePath = () => {
    tempDir = tempDir || temp.mkdirSync('gemini-fails');
    return temp.path({dir: tempDir, suffix: '.png'});
};
