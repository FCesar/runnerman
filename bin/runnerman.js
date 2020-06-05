#!/usr/bin/env node

const { program } = require('commander');
const { parseJsonFile } = require('../lib/util/parseJsonFile');
const { getFilesInFolderPerExtension } = require('../lib/util/getFilesInFolderPerExtension');
const { runnerman } = require('..');
const { version } = require('../package.json');

const collect = (value, previous) => previous.concat([value]);

program
    .version(version)
    .option('-c, --collection <type>')
    .option('-e, --environment <type>')
    .option('-s, --suite <value>', '', collect, [])
    .option('-i, --iterations <type>')
    .parse(process.argv);

async function main(option) {
    if (
        program.collection === '' ||
        program.environment === '' ||
        program.suite === undefined ||
        program.suite.length === 0
    ) {
        program.help();
    }

    const collection = await parseJsonFile(option.collection);

    const environment = option.environment !== undefined ? await parseJsonFile(option.environment) : {};

    const iterations = parseInt(option.iterations, 10) || 1;

    const suites = new Set();

    for await (const item of program.suite) {
        const items = await getFilesInFolderPerExtension(item, 'suite');
        items.forEach(x => suites.add(x));
    }

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

    let exitCode = 0;

    if (summaries.some(y => y.run.failures.length > 0)) {
        exitCode = 1;
    }

    process.exit(exitCode);
}

// Main call
(async () => {
    try {
        const result = await main();
        console.log(result);
    } catch (error) {
        console.error(error);
    }
})();
