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

module.exports.main = async option => {
    if (option.collection === undefined || option.collection === '' ||
      option.environment === '' ||
      option.suite === undefined || option.suite === '') {
        option.help();
    }

    const collection = await parseJsonFile(option.collection);

    const environment = option.environment !== undefined ? await parseJsonFile(option.environment) : {};

    const iterations = parseInt(option.iterations, 10) || 1;

    const suites = await getFilesInFolderPerExtension(option.suite, 'suite');


    const summaries = [];

    for (const suite of suites) {
        // eslint-disable-next-line no-await-in-loop
        const summary = await runnerman(
            {
                name: suite,
                // eslint-disable-next-line no-await-in-loop
                obj: await parseJsonFile(suite)
            },
            collection,
            environment,
            iterations
        );
        summaries.push(summary);
    }

    let exitCode = 0;

    if (summaries.some(x => x.run.failures.length > 0)) exitCode = 1;

    process.exit(exitCode);
};

(async option => {
    try {
        const result = await module.exports.main(option);
        console.log(result);
    } catch (error) {
        console.error(error);
    }
})(program);
