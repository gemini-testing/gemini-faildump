'use strict';

const fs = require('fs-extra');
const proxyquire = require('proxyquire');

describe('image-processor', () => {
    const sandbox = sinon.sandbox.create();
    let imageProcessor;
    const looksSameStub = sandbox.stub();

    beforeEach(() => {
        imageProcessor = proxyquire('../../lib/image-processor', {
            'looks-same': looksSameStub
        });
        sandbox.stub(fs, 'readFile').resolves('base64');
    });

    afterEach(() => sandbox.restore());

    it('should generate base64 from image', () => {
        return imageProcessor.pngToBase64('imagePath')
            .then((base64) => assert.equal(base64, 'base64'));
    });

    it('should compare images end return results', () => {
        looksSameStub.yields(null, true);

        return imageProcessor.compare('path1', 'path2')
            .then((isEqual) => assert.ok(isEqual));
    });
});
