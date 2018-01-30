const temp = require('temp');
const clearRequire = require('clear-require');

describe('temp-fs', () => {
    const sandbox = sinon.sandbox.create();
    let tempFS;

    beforeEach(() => {
        sandbox.stub(temp, 'mkdirSync').returns('/some/temp/folder');

        clearRequire('../../lib/temp-fs');
        tempFS = require('../../lib/temp-fs');
    });

    afterEach(() => sandbox.restore());

    it('should create temp dir on first call', () => {
        tempFS.resolveImagePath();

        assert.calledOnce(temp.mkdirSync);
        assert.calledWith(temp.mkdirSync, 'gemini-fails');
    });

    it('should create temp dir only once', () => {
        tempFS.resolveImagePath();
        tempFS.resolveImagePath();

        assert.calledOnce(temp.mkdirSync);
    });

    it('should resolve valid path for saving image in temp folder', () => {
        assert.match(tempFS.resolveImagePath(), /^\/some\/temp\/folder\/.+\.png$/);
    });
});
