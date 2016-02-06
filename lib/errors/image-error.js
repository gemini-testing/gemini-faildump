'use strict';

var _ = require('lodash'),
    inherit = require('inherit'),

    BaseError = require('./base-error');

var ImageError = inherit(BaseError, {
    __constructor: function(data, config, img) {
        this.__base(data, config);
        this.imagePath = img.path;
        this.base64 = img.base64;
        this.isDiff = data.equal !== undefined;
    },

    getData: function() {
        return _.defaults(this.__base(), {
                base64: this.base64
            });
    }
});

module.exports = ImageError;
