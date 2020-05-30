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

module.exports.main = async (program) => {
  if (program.collection === undefined || program.collection === '' ||
      program.environment === '' ||
      program.suite === undefined || program.suite === '')
  {
    program.help();
  }

  const collection = await parseJsonFile(program.collection);

  const environment = program.environment !== undefined ? await parseJsonFile(program.environment) : {};

  const iterations = parseInt(program.iterations) || 1;

  const suites = await getFilesInFolderPerExtension(program.suite, "suite");


  const summaries = [];

  for(const suite of suites) {
    const summary = await runnerman({
      "name": suite,
      "obj": await parseJsonFile(suite)
    }, collection, environment, iterations);
    summaries.push(summary);
  };

  let exitCode = 0;

  if (summaries.some(x => x.run.failures.length > 0))
    exitCode = 1

  process.exit(exitCode);
}

(async (program) => {
  try {
      const result = await module.exports.main(program);
      console.log(result);
  } catch (error) {
      console.error(error);
  }
})(program);