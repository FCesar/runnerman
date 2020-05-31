#!/usr/bin/env node

const { parseJsonFile } = require('../lib/util/parseJsonFile');
const { getFilesInFolderPerExtension } = require('../lib/util/getFilesInFolderPerExtension');
const { runnerman } = require('..');
const { program } = require('commander');
const { version } = require('../package.json');

const collect = (value, previous) => previous.concat([value]);

program
  .version(version)
  .option('-c, --collection <type>')
  .option('-e, --environment <type>')
  .option('-s, --suite <value>', '', collect, [])
  .option('-i, --iterations <type>')
  .parse(process.argv);

(async function main(program) {
  if (program.collection === '' ||
      program.environment === '' ||
      program.suite === undefined ||
      program.suite.length === 0)
  {
    program.help();
  }

    const collection = parseJsonFile(program.collection);

    const environment = program.environment !== undefined && parseJsonFile(program.environment);

    const iterations = parseInt(program.iterations) || 1;

  const suites = new Set();

  for (const item of program.suite) {
    var items = await getFilesInFolderPerExtension(item, "suite");
    items.forEach(x => suites.add(x));
  };

    const summaries = [];

    for (const suite of suites) {
        const summary = await runnerman(
            {
                name: suite,
                obj: parseJsonFile(suite)
            },
            collection,
            environment,
            iterations
        );
        summaries.push(summary);
    }

    let exitCode = 0;

  if (summaries.some(y => y.run.failures.length > 0)) {
    exitCode = 1
  }

    process.exit(exitCode);
})(program);
