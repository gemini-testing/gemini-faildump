'use strict';

var q = require('q'),
    imageProcessor = require('../../lib/image-processor'),
    fs = require('q-io/fs');

describe('image-processor', function () {
    var sandbox = sinon.sandbox.create();

    beforeEach(function () {
        sandbox.stub(fs);
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should generate base64 from image', function () {
        fs.read.returns(q('base64'));

        return imageProcessor.pngToBase64('imagePath')
            .then(function (base64) {
                assert.equal(base64, 'base64');
            });
    });

    it('should compare images end return results', function () {
        fs.read.returns(q('base64'));
        sandbox.stub(q, 'nfcall').returns(q(true));

        return imageProcessor.compare('path1', 'path2')
            .then(function (isEqual) {
                assert.ok(isEqual);
            });
    });
});
