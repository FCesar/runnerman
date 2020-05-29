const { readFile, stat } = require("fs");
const { format, promisify } = require("util");

const asyncStat = promisify(stat);
const asyncReadFile = promisify(readFile);

module.exports = {
    parseJsonFile: async path => {
        const stats = await asyncStat(path);

        if (!stats.isFile()) {
            throw `'${path}' is not a file`;
        }
                    
        const fileRead = await asyncReadFile(stats);

        return JSON.parse(fileRead.toString());        
    }
};
