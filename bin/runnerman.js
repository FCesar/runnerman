#!/usr/bin/env node

const { program } = require('commander');
const { parseJsonFile } = require('../lib/util/parseJsonFile');
const { getFilesInFolderPerExtension } = require('../lib/util/getFilesInFolderPerExtension');
const { runnerman } = require('..');
const { version } = require('../package.json');

program
    .version(version)
    .option('-c, --collection <type>')
    .option('-e, --environment <type>')
    .option('-s, --suite <type>')
    .option('-i, --iterations <type>')
    .parse(process.argv);

(async function main(option) {
    if (option.collection === '' || option.environment === '' || option.suite === '') {
        option.help();
    }

    const collection = parseJsonFile(option.collection);

    const environment = option.environment !== undefined && parseJsonFile(option.environment);

    const iterations = parseInt(option.iterations, 10) || 1;

    const suites = getFilesInFolderPerExtension(option.suite, 'suite');

    const summaries = [];

    for await (const suite of suites) {
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

    if (summaries.some(x => x.run.failures.length > 0)) {
        process.exit(1);
    }
}(program));
