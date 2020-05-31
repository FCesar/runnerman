const { getFilesInFolderPerExtension } = require('../../lib/util/getFilesInFolderPerExtension');

jest.mock('fs');

describe('Test -> Util -> getFilesInFolderPerExtension', () => {
    it('Should return all files with extension suite', () => {
        const MOCK_FILE_INFO = {
            '/path/to/file1.js': 'console.log("file1 contents");',
            '/path/to/file2.txt': 'file2 contents',
            '/path/to/suite1.suite': 'file2 contents',
            '/path/to/suite2.suite': 'file2 contents'
        };

        require('fs').__setMockFiles(MOCK_FILE_INFO);

        const path = '/path/to';
        const extension = 'suite';
        const result = getFilesInFolderPerExtension(path, extension);

        expect(result.length).toBe(2);
    }),
        it('Should return all files suites', () => {
            const MOCK_FILE_INFO = {};

            require('fs').__setMockFiles(MOCK_FILE_INFO);

            const path = '/path/to';
            const extension = 'suite';

            expect(() => {
                getFilesInFolderPerExtension(path, extension);
            }).toThrow();
        });

    it('Should return all files suitess', () => {
        const MOCK_FILE_INFO = {
            '/path/to/file1.suite': 'console.log("file1 contents");'
        };

        require('fs').__setMockFiles(MOCK_FILE_INFO);

        const path = 'file1.suite';
        const extension = 'suite';
        const result = getFilesInFolderPerExtension(path, extension);

        expect(result.length).toBe(1);
    });
});
