'use strict';

var temp = require('temp'),
    tempDir;

temp.track();

exports.resolveImagePath = function () {
    tempDir = tempDir || temp.mkdirSync('gemini-fails');
    return temp.path({ dir: tempDir, suffix: '.png' });
};
