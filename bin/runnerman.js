#!/usr/bin/env node

const { program } = require('commander');
const { parseJsonFile } = require('../lib/util/parseJsonFile');
const { getFilesInFolderPerExtension } = require('../lib/util/getFilesInFolderPerExtension');
const { awaitLast } = require('../lib/util/awaitLast');
const { runnerman } = require('..');
const { version } = require('../package.json');

function collect(value, previous) {
    return previous.concat([value]);
}

program
    .version(version, '-v, --version')
    .requiredOption('-c, --collection <type>')
    .option('-e, --environment <value>')
    .option('-s, --suite <value>', '', collect, [])
    .option('-i, --iterations <number>')
    .option('-p, --parallelize')
    .parse(process.argv);

(async function main(option) {
    if (option.collection === '' ||
      option.environment === '' ||
      option.suite.length === 0) {
        option.help();
    }

    const collection = parseJsonFile(option.collection);

    const environment = option.environment && parseJsonFile(option.environment);

    const iterations = parseInt(option.iterations, 10) || 1;

    const items = [];

    for (const item of option.suite) {
        items.push(getFilesInFolderPerExtension(item, 'suite'));
    }

    await Promise.all(items);

    const suites = new Set();

    // TODO:  Verify if exist batter approach
    items.forEach(element => element.forEach(x => suites.add(x)));

    const summaries = [];

    const resolveds = [];

    if (option.parallelize) {
        for (const suite of suites) {
            // eslint-disable-next-line no-await-in-loop
            const summary = runnerman({
                name: suite,
                obj: parseJsonFile(suite)
            }, collection, environment, iterations);
            summaries.push(summary);
        }
        Object.assign(resolveds, await awaitLast(summaries, []));
    } else {
        for (const suite of suites) {
            // eslint-disable-next-line no-await-in-loop
            const summary = await runnerman({
                name: suite,
                obj: parseJsonFile(suite)
            }, collection, environment, iterations);
            summaries.push(summary);
        }
        Object.assign(resolveds, summaries);
    }

    if (resolveds.some(y => y.run.failures.length > 0)) {
        process.exit(1);
    }
}(program));
