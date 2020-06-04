const { _ } = require('lodash');
const { stat, readFile, writeFile } = require('fs');
const { promisify } = require('util');

const asyncStat = promisify(stat);
const asyncReadFile = promisify(readFile);
const asyncWriteFile = promisify(writeFile);

module.exports = {
    replaceFile: async (path = '', replace = {}) => {
        if (_.isEmpty(path)) {
            throw new Error('Path is blank.');
        }

        const stats = await asyncStat(path);

        if (!stats.isFile()) {
            throw new Error(`${path}, is not a file.`);
        } else if (_.isEmpty(replace)) {
            throw new Error('Replace is blank.');
        }
        const file = await asyncReadFile(path, 'utf8');

        const a = new RegExp(replace.regxp);

        const result = file.replace(a, replace.value);

        asyncWriteFile(path, result, 'utf8');

        return path;
    }
};

const args = process.argv.slice(2);

module.exports.replaceFile(args[0], { regxp: new RegExp(args[1], args[2]), value: args[3] });
