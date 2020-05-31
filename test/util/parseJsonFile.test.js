const { stat, readFile } = require('fs');

jest.mock('fs');

const { parseJsonFile } = require('../../lib/util/parseJsonFile');

describe('Util', () => {
    describe('parseJoinFile', () => {
        it('Should throw error when stat returns eager error', async () => {
            const expectedError = 'Test error message';
            stat.mockImplementationOnce(jest.fn((_, callback) => callback('Test error message')));

            const path = '/testFolder';

            const promise = parseJsonFile(path);

            await expect(promise).rejects.toEqual(expectedError);
        });

        it('Should throw error when path is not a file', async () => {
            const expectedError = "'/testFolder' is not a file";
            stat.mockImplementationOnce(jest.fn((_, callback) => callback(undefined, { isFile: () => false })));

            const path = '/testFolder';

            const promise = parseJsonFile(path);

            await expect(promise).rejects.toEqual(new Error(expectedError));
        });

        it('Should returned json parsed content from file read', async () => {
            const expectedResponse = { key: 'value' };
            stat.mockImplementationOnce(jest.fn((_, callback) => callback(undefined, { isFile: () => true })));
            readFile.mockImplementationOnce(
                jest.fn((_, callback) => callback(undefined, JSON.stringify(expectedResponse)))
            );
            const path = '/testFolder';

            const promise = parseJsonFile(path);

            await expect(promise).resolves.toEqual(expectedResponse);
        });
    });
});
