const { stat, readFile } = require('fs');
const { replaceFile } = require('../../lib/util/replaceFile');

jest.mock('fs');

describe('Test -> Util -> replaceFile', () => {
    it('Should throw error if path is blank', async () => {
        const promise = replaceFile('');

        await expect(promise).rejects.toThrow();
    });

    it('Should throw error if path is not file', async () => {
        stat.mockImplementationOnce(jest.fn((_, callback) => callback(undefined, { isFile: () => false })));
        const promise = replaceFile('/path');

        await expect(promise).rejects.toThrow();
    });

    it('Should throw error if stat fail', async () => {
        const error = new Error('Any Error');
        stat.mockImplementationOnce(jest.fn((_, callback) => callback(error)));
        const promise = replaceFile('/path');

        await expect(promise).rejects.toThrow();
    });

    it('Should throw error if replaces is blank', async () => {
        stat.mockImplementationOnce(jest.fn((_, callback) => callback(undefined, { isFile: () => true })));

        const promise = replaceFile('/path/file.xpto', Object.create(null));

        await expect(promise).rejects.toThrow();
    });

    it('Should throw error if readFile fail', async () => {
        const error = new Error('Any Error');
        stat.mockImplementationOnce(jest.fn((_, callback) => callback(undefined, { isFile: () => true })));
        readFile.mockImplementationOnce(jest.fn((_, callback) => callback(error, undefined)));
        const promise = replaceFile('/path/file.xpto', { regxp: /abc/g, value: '' });

        await expect(promise).rejects.toThrow();
    });

    it('Should success', async () => {
        stat.mockImplementationOnce(jest.fn((_, callback) => callback(undefined, { isFile: () => true })));
        readFile.mockImplementationOnce(jest.fn((path, encode, callback) => callback(undefined, 'abcd')));
        const promise = replaceFile('/path/file.xpto', { regxp: /abc/g, value: '' });

        await expect(promise).resolves.toEqual('/path/file.xpto');
    });
});
