const { readFileSync } = require("fs");


module.exports = {
    parseJsonFile: filename => JSON.parse(readFileSync(filename).toString())
};
