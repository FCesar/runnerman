#!/usr/bin/env node

const { parseJsonFile } = require('../lib/util/parseJsonFile')
const { getFilesInFolderPerExtension } = require("../lib/util/getFilesInFolderPerExtension");
const { spaceman } = require("../");
const { program } = require('commander');
const { version } = require('../package.json');


program
  .version(version)
  .option('-c, --collection <type>')
  .option('-e, --environment <type>')
  .option('-s, --suite <type>')
  .option('-i, --iterations <type>')
  .parse(process.argv);

if (program.collection === '' ||
  program.environment === '' ||
  program.suite === '')
{
  program.help();
}

(async function main() {
  const collection = parseJsonFile(program.collection);

  const environment = program.environment !== undefined && parseJsonFile(program.environment);

  const suites = getFilesInFolderPerExtension(program.suite, "suite").map((suite) => {
    return { "name": suite, "obj": parseJsonFile(suite) } ;
  });

  const iterations = parseInt(program.iterations) || 1;

  const exitCode = await spaceman(suites, collection, environment, iterations);

  process.exit(exitCode);
})();
