const { Collection, Event, Script } = require('postman-collection');
const { run: newman } = require('newman');
const { format } = require('util');
const { v4: uuidv4 } = require('uuid');
const { isEmpty, last } = require('lodash');
const { parseJsonFile } = require('./util/parseJsonFile');
const { filterCollection } = require('./util/filterCollection');
const { generateGlobals } = require('./util/generateGlobal');
const { createGlobalVariable } = require('./util/createGlobalVariable');

module.exports = {
    run: async (path, collectionDefinition, environment, iterationCount, reporters) => {
        const promise = new Promise(resolve => {
            const obj = parseJsonFile(path);

            const globals = generateGlobals(obj);

            const filteredCollectionDefinition = filterCollection(collectionDefinition, obj);

            const collection = new Collection(filteredCollectionDefinition);

            const runner = newman({
                collection,
                environment,
                globals,
                iterationCount,
                reporters
            });

            runner.on('start', () => {
                Object.assign(runner.summary, { consoleColor: '\x1b[32m' });
            });

            runner.on('beforeItem', (err, summary) => {
                const guid = uuidv4();

                Object.assign(runner.summary, { guid });

                const s = obj[summary.cursor.position];

                if (s[summary.item.name].data !== undefined) {
                    const { data } = { ...s[summary.item.name] };

                    // TODO: Fix this assigned.
                    let result = data;

                    if (typeof data === 'function') {
                        result = data(err, summary, runner.summary);
                    } else {
                        Object.entries(data).forEach(([key, value]) => {
                            if (typeof value === 'function') {
                                const newObj = Object.create();
                                newObj[key] = value(err, summary, runner.summary);
                                Object.assign(result, newObj);
                            }
                        });
                    }

                    // TODO: Remover this variables in "item"
                    Object.assign(
                        runner.summary,
                        createGlobalVariable(result, summary.cursor.position, runner.summary)
                    );
                }
            });

            runner.on('request', (err, summary) => {
                if (err) {
                    runner.summary.consoleColor = '\x1b[31m';
                } else if (!isEmpty(summary.response)) {
                    const buffer = summary.response.stream;

                    const response = JSON.parse(buffer.toString());

                    const variable = globals.values.members[summary.cursor.position].value;

                    const result = summary.response.code === variable.code;

                    const event = new Event({
                        listen: 'test',
                        script: new Script({
                            exec: format('tests["%s"] = %s', runner.summary.guid, result.toString())
                        })
                    });

                    summary.item.events.members.push(event);

                    if (summary.response.code === variable.code && buffer.byteLength > 0) {
                        Object.assign(
                            runner.summary,
                            createGlobalVariable(response, summary.cursor.position, runner.summary)
                        );
                    }
                }
            });

            runner.on('item', err => {
                if (err) {
                    runner.summary.consoleColor = '\x1b[31m';
                }
            });

            runner.on('assertion', err => {
                if (err) {
                    runner.summary.consoleColor = '\x1b[31m';
                }
            });

            runner.on('exception', err => {
                if (err) {
                    this.summary.consoleColor = '\x1b[31m';
                }
            });

            runner.on('done', () => {
                console.log(`\x1b[0m\x1b[1m${runner.summary.consoleColor}`, `'Suite ${path} run completed!'`);
                resolve(runner.summary);
            });
        });

        return promise;
    },

    runnerman: async (suites, collectionDefinition, environment, iterationCount, reporters, parallelize) => {
        const promisies = [];
        for await (const path of suites) {
            const promise = module.exports.run(path, collectionDefinition, environment, iterationCount, reporters);

            promisies.push(promise);

            if (!parallelize) {
                await last(promisies);
            }
        }

        Object.assign(promisies, await Promise.all(promisies));

        return promisies;
    }
};
