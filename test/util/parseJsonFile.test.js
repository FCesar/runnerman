const fs = require("fs");
jest.mock("fs");

const { parseJsonFile } = require("../../lib/util/parseJsonFile");

describe("Util", () => {
  describe("parseJoinFile", () => {
    it("Should throw error when stat returns eager error", async () => {
      const expectedError = "Test error message";
      fs.stat.mockImplementationOnce(
        jest.fn((_, callback) => callback("Test error message"))
      );

      const path = "/testFolder";
      //OLLHA ESSA LINHA
      // yus
      const promise = parseJsonFile(path);

      return expect(promise).rejects.toEqual(expectedError);
    });

    it("Should throw error when path is not a file", async () => {
      const expectedError = "'/testFolder' is not a file";
      fs.stat.mockImplementationOnce(
        jest.fn((_, callback) => callback(undefined, { isFile: () => false }))
      );

      const path = "/testFolder";

      const promise = parseJsonFile(path);

      return expect(promise).rejects.toEqual(expectedError);
    });

    it("Should returned json parsed content from file read", async () => {
      const expectedResponse = { key: "value" };
      fs.stat.mockImplementationOnce(
        jest.fn((_, callback) => callback(undefined, { isFile: () => true }))
      );
      fs.readFile.mockImplementationOnce(
        jest.fn((_, callback) =>
          callback(undefined, JSON.stringify({ key: "value" }))
        )
      );
      const path = "/testFolder";

      const promise = parseJsonFile(path);

      return expect(promise).resolves.toEqual(expectedResponse);
    });
  });
});
