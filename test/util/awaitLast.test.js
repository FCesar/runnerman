const { awaitLast } = require('../../lib/util/awaitLast');

describe('Test -> Util -> getFilesInFolderPerExtension', () => {
    it('Should return all files with extension suite', async () => {
        const p1 = new Promise(resolve => {
            setTimeout(resolve, 500, 'one');
        });

        const p2 = new Promise(resolve => {
            setTimeout(resolve, 100, 'two');
        });

        const p3 = new Promise(resolve => {
            setTimeout(resolve, 300, 'three');
        });

        const promises = [p1, p2, p3];

        const promise = awaitLast(promises, []);

        await promise.then(data => expect(data).toStrictEqual(['two', 'one', 'three']));
    });
});
