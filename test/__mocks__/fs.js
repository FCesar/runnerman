/* eslint-disable no-redeclare */
/* eslint-disable block-scoped-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable no-shadow */
/* eslint-disable no-restricted-syntax */
const path = require('path');

const fs = jest.genMockFromModule('fs');

// This is a custom function that our tests can use during setup to specify
// what the files on the "mock" filesystem should look like when any of the
// `fs` APIs are used.
let mockFiles = Object.create(null);
let mockFilesStats = Object.create(null);

// eslint-disable-next-line no-underscore-dangle
function __setMockFiles(newMockFiles) {
    mockFiles = Object.create(null);
    mockFilesStats = [];
    // eslint-disable-next-line guard-for-in
    for (const file in newMockFiles) {
        const dir = path.dirname(file);

        if (!mockFiles[dir]) {
            mockFiles[dir] = [];

            var stats = jest.fn(path => path);
            stats.isFile = jest.fn(() => false);

            mockFilesStats[dir] = stats;
        }

        const name = path.basename(file);

        if (!mockFilesStats[name]) {
            var stats = jest.fn(path => path);
            stats.isFile = jest.fn(() => true);

            mockFilesStats[name] = stats;
        }

        mockFiles[dir].push(name);
    }
}

function readdirSync(path) {
    return mockFiles[path] || [];
}

function existsSync(path) {
    return mockFiles[path] || mockFilesStats[path];
}

function lstatSync(path) {
    return mockFilesStats[path];
}

// eslint-disable-next-line no-underscore-dangle
fs.__setMockFiles = __setMockFiles;
fs.readdirSync = readdirSync;
fs.existsSync = existsSync;
fs.lstatSync = lstatSync;

module.exports = fs;
