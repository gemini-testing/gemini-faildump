var temp = require('temp'),
    clearRequire = require('clear-require');

describe('temp-fs', function() {
    var sandbox = sinon.sandbox.create(),
        tempFs;

    beforeEach(function() {
        sandbox.stub(temp, 'mkdirSync').returns('/some/temp/folder');

        clearRequire('../../lib/temp-fs');
        tempFS = require('../../lib/temp-fs');
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should create temp dir on first call', function() {
        tempFS.resolveImagePath();

        assert.calledOnce(temp.mkdirSync);
        assert.calledWith(temp.mkdirSync, 'gemini-fails');
    });

    it('should create temp dir only once', function() {
        tempFS.resolveImagePath();
        tempFS.resolveImagePath();

        assert.calledOnce(temp.mkdirSync);
    });

    it('should resolve valid path for saving image in temp folder', function() {
        assert.match(tempFS.resolveImagePath(), /^\/some\/temp\/folder\/.+\.png$/);
    });
});
