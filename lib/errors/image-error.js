'use strict';

const _ = require('lodash');
const q = require('q');
const fs = require('q-io/fs');

const tempFS = require('../temp-fs');
const BaseError = require('./base-error');
const imageProcessor = require('../image-processor');

module.exports = class ImageError extends BaseError {
    constructor(data, config, options) {
        super(data, config);

        this.imagePath = data.imagePath || tempFS.resolveImagePath();
        this.saveImg = data.imagePath ? q : data.saveDiffTo.bind(data);
        this.light = options.light;
        this.isDiff = !_.isUndefined(data.equal);
    }

    getData() {
        const baseErrData = super.getData();

        return this.light ? baseErrData : this._addBase64(baseErrData);
    }

    save() {
        return this.saveImg(this.imagePath)
            .catch((error) => console.error(`Error occurred while saving image: ${error.stack || error}`));
    }

    _addBase64(baseErrData) {
        return fs.exists(this.imagePath)
            .then((isImgExists) => isImgExists || this.save())
            .then(() => imageProcessor.pngToBase64(this.imagePath))
            .then((base64) => _.extend(baseErrData, {base64}))
            .catch((error) => console.error(error.stack || error));
    }
};
