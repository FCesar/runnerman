const { existsSync, lstatSync, readdirSync } = require('fs');
const { format } = require('util');
const { extname, join, posix, dirname } = require('path');

module.exports = {
    getFilesInFolderPerExtension: (path, extension) => {
        if (!existsSync(path)) {
            throw Error(format("%s it' not a file", path));
        } else if (lstatSync(path).isFile()) {
            return [join(dirname(path), posix.basename(path))];
        }

        const files = readdirSync(path).filter(file => extname(file) === format('.%s', extension));
        Object.assign(
            files,
            files.map(item => join(path, item))
        );

        return files;
    }
};
