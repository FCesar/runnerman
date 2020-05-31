const fs = require("fs");
jest.mock("fs");

const { getFilesInFolderPerExtension } = require("../../lib/util/getFilesInFolderPerExtension");

describe('Test -> Util -> getFilesInFolderPerExtension', () => {
    it('Should return all files with extension suite', async () => {

      const mockFiles = {
        "/path/to": [
          '/path/to/suite1.suite',
          '/path/to/suite2.suite'
        ]
      };

      fs.stat.mockImplementationOnce(
        jest.fn((_, callback) => callback(undefined, { isDirectory: () => true }))
      );

      fs.readdir.mockImplementationOnce(
        jest.fn((path, callback) => callback(undefined, mockFiles[path]))
      );

      const path = "/path/to";
      const extension = "suite"
      const promise = getFilesInFolderPerExtension(path, extension);

      await promise.then(data => expect(data.length).toBe(2));
    }),
    it('Should stat throw any error', async () => {

      const expectedError = "Test error message";
      fs.stat.mockImplementationOnce(
        jest.fn((_, callback) => callback("Test error message"))
      );

      const path = "/path/to";
      const extension = "suite"

      var promise = getFilesInFolderPerExtension(path, extension);

      await expect(promise).rejects.toEqual(expectedError);
    })

    it('Should return list with on file if file is suite', async () => {

      fs.stat.mockImplementationOnce(
        jest.fn((_, callback) => callback(undefined, { isDirectory: () => false }))
      );

      const path = "file1.suite";
      const extension = "suite"
      const promise = getFilesInFolderPerExtension(path, extension);

      await promise.then(data => expect(data.length).toBe(1));
    })

    it('Should throw error if path not suite file or directory', async () => {

      fs.stat.mockImplementationOnce(
        jest.fn((_, callback) => callback(undefined, { isDirectory: () => false }))
      );

      const path = "file1.txt";
      const extension = "suite"
      const promise = getFilesInFolderPerExtension(path, extension);

      await expect(promise).rejects.toThrow();
    })
});
