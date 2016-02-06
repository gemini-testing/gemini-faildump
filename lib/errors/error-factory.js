'use strict';

var q = require('q'),
    temp = require('temp'),

    BaseError = require('./base-error'),
    ImageError = require('./image-error'),
    imageProcessor = require('../image-processor');

temp.track();

exports.buildError = function(data, geminiConfig, options) {
    if (data.name !== 'StateError' && data.equal === undefined) {
        return q(new BaseError(data, geminiConfig));
    }

    var tempDir = temp.mkdirSync('gemini-fails'),
        imagePath = temp.path({dir: tempDir, suffix: '.png'}),
        saveImg = data.name === 'StateError'
            ? data.image.save.bind(data.image)
            : data.saveDiffTo.bind(data);

    return saveImg(imagePath)
        .then(function() {
            if (!options.light) {
                return imageProcessor.pngToBase64(imagePath);
            }
        })
        .then(function(base64) {
            return new ImageError(data, geminiConfig, {
                path: imagePath,
                base64: base64
            });
        });
};
