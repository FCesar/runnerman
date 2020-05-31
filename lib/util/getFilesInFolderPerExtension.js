const { existsSync, lstatSync, readdirSync } = require('fs');
const { format } = require('util');
const { extname, join } = require('path');

module.exports = {
    getFilesInFolderPerExtension: (path, extension) => {
        if (!existsSync(path)) {
            throw Error(format("%s it' not a file", path));
        } else if (lstatSync(path).isFile()) {
            return [path];
        }

        const files = readdirSync(path).filter((file) => extname(file) === format('.%s', extension));
        files.forEach((item, index, arr) => {
            arr[index] = join(path, item);
        });

        return files;
    }
};
