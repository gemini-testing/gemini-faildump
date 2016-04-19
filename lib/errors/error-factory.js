'use strict';

var q = require('q'),
    tempFS = require('../temp-fs'),

    BaseError = require('./base-error'),
    ImageError = require('./image-error'),
    imageProcessor = require('../image-processor');

exports.buildError = function (data, geminiConfig, options) {
    if (!data.imagePath && !data.saveDiffTo) {
        return q(new BaseError(data, geminiConfig));
    }

    var imagePath = data.imagePath || tempFS.resolveImagePath(),
        saveImg = data.imagePath ? q : data.saveDiffTo.bind(data);

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
