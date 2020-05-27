#!/usr/bin/env node

const { parseJsonFile } = require('../lib/util/parseJsonFile')
const { getFilesInFolderPerExtension } = require("../lib/util/getFilesInFolderPerExtension");
const { runnerman } = require("..");
const { program } = require('commander');
const { version } = require('../package.json');

program
  .version(version)
  .option('-c, --collection <type>')
  .option('-e, --environment <type>')
  .option('-s, --suite <type>')
  .option('-i, --iterations <type>')
  .parse(process.argv);

(async function main(program) {
  if (program.collection === '' ||
      program.environment === '' ||
      program.suite === '')
  {
    program.help();
  }

  const collection = parseJsonFile(program.collection);

  const environment = program.environment !== undefined && parseJsonFile(program.environment);

  const iterations = parseInt(program.iterations) || 1;

  const suites = getFilesInFolderPerExtension(program.suite, "suite");

  for(const suite of suites) {
    await runnerman({
      "name": suite,
      "obj": parseJsonFile(suite)
    }, collection, environment, iterations);
  };

  process.exit(0);
})(program);
