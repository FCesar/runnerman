const { readdir, stat } = require('fs');
const { promisify } = require('util');
const { extname, join } = require('path');

const asyncStat = promisify(stat);
const asyncReaddir = promisify(readdir);

const getFilesInFolderPerExtension = async (path, extension) => {
    const stats = await asyncStat(path);

    if (stats.isDirectory()) {
        const files = await asyncReaddir(path);

        const filtredFiles = files.filter(file => extname(file) === `.${extension}`);

        filtredFiles.forEach((item, index, arr) => {
            arr[index] = join(path, item);
        });

        return filtredFiles;
    }
    if (extname(path) === `.${extension}`) {
        return [path];
    }
    throw new Error(`"Extension .${extension} not suported.`);
};

module.exports = { getFilesInFolderPerExtension };
