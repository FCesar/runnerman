const { existsSync, readFileSync } = require('fs');
const { format } = require('util');

module.exports = {
    parseJsonFile: (path) => {
        if (!existsSync(path)) {
            Error(format("%s it' not a file", path));
        }

        return JSON.parse(readFileSync(path).toString());
    }
};
