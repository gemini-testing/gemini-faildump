'use strict';

var q = require('q'),
    looksSame = require('looks-same'),
    fs = require('q-io/fs');

module.exports = {
    compare: function(path1, path2) {
        return q.nfcall(looksSame, path1, path2, {ignoreCaret: true})
            .catch(function (error) {
                console.error(error.stack || error);
            });
    },

    pngToBase64: function(path) {
        return fs.read(path, 'b')
            .then(function (content) {
                return content.toString('base64');
            })
            .catch(function (error) {
                console.error(error.stack || error);
            });
    }
};
