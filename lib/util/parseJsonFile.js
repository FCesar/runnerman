const { readFile, stat } = require("fs");
const { format } = require("util");


module.exports = {
    parseJsonFile: async (path) => {
        return new Promise((resolve, reject) => {
            stat(path, (statErr, stat) => {
                if(statErr) reject(statErr);
                stat.isFile() || reject(format('%s it\' not a file', path));
                readFile(path, (readFileErr, readFile) => {
                    if(readFileErr) reject(readFileErr);
                    resolve(JSON.parse(readFile.toString()));
                });
            });
        });
    }
};
