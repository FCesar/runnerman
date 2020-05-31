#!/usr/bin/env node

const { program } = require('commander');
const { parseJsonFile } = require('../lib/util/parseJsonFile');
const { getFilesInFolderPerExtension } = require('../lib/util/getFilesInFolderPerExtension');
const { runnerman } = require('..');
const { version } = require('../package.json');

const main = async option => {
    program
        .version(version)
        .option('-c, --collection <type>')
        .option('-e, --environment <type>')
        .option('-s, --suite <type>')
        .option('-i, --iterations <type>')
        .parse(process.argv);

    if (
        option.collection === undefined ||
        option.collection === '' ||
        option.environment === '' ||
        option.suite === undefined ||
        option.suite === ''
    ) {
        option.help();
    }

    const collection = await parseJsonFile(option.collection);

    const environment = option.environment !== undefined ? await parseJsonFile(option.environment) : {};

    const iterations = parseInt(option.iterations, 10) || 1;

    const suites = await getFilesInFolderPerExtension(option.suite, 'suite');

    const summaries = [];

    for await (const suite of suites) {
        const summary = await runnerman(
            {
                name: suite,
                obj: await parseJsonFile(suite)
            },
            collection,
            environment,
            iterations
        );
        summaries.push(summary);
    }

    const exitCode = summaries.some(x => x.run.failures.length > 0) ? 1 : 0;

    process.exit(exitCode);
};

// Main call
(async () => {
    try {
        const result = await main();
        console.log(result);
    } catch (error) {
        console.error(error);
    }
})();
