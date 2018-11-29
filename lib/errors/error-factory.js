'use strict';

const BaseError = require('./base-error');
const ImageError = require('./image-error');

exports.buildError = (data, config, options) => {
    return (data.img || data.saveDiffTo)
        ? new ImageError(data, config, options)
        : new BaseError(data, config);
};
