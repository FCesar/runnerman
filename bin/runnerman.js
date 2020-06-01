#!/usr/bin/env node

const { program } = require('commander');
const { _ } = require('lodash');
const { parseJsonFile } = require('../lib/util/parseJsonFile');
const { getFilesInFolderPerExtension } = require('../lib/util/getFilesInFolderPerExtension');
const { runnerman } = require('..');
const { version } = require('../package.json');

const collect = (value, previous) => previous.concat([value]);

program
    .version(version, '-v, --version')
    .requiredOption('-c, --collection <type>')
    .option('-e, --environment <value>')
    .option('-s, --suite <value>', '', collect, [])
    .option('-i, --iterations <number>')
    .option('-p, --parallelize')
    .parse(process.argv);

(async function main(option) {
    if (option.collection === '' || option.environment === '' || option.suite.length === 0) {
        option.help();
    }

    const collection = parseJsonFile(option.collection);

    const environment = option.environment && parseJsonFile(option.environment);

    const iterations = parseInt(option.iterations, 10) || 1;

    const suites = [];

    for await (const item of option.suite) {
        const paths = getFilesInFolderPerExtension(item, 'suite');
        Object.assign(suites, _.union(suites, suites.concat(paths)));
    }

    const summaries = await runnerman(suites, collection, environment, iterations, undefined, option.parallelize);

    if (summaries.some((y) => y.run.failures.length > 0)) {
        process.exit(1);
    }
})(program);
