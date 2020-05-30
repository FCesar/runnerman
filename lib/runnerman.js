const { Collection, Event, Script } = require('postman-collection');
const { run: newman } = require('newman');
const { format } = require('util');
const { v4: uuidv4 } = require('uuid');
const { filterCollection } = require('./util/filterCollection');
const { generateGlobals } = require('./util/generateGlobal');
const { createGlobalVariable } = require('./util/createGlobalVariable');


module.exports = async function runnerman(suite, collectionDefinition, environment, iterationCount, reporters) {
    let guid = null;

    let consoleColor = '\x1b[32m';

    const promises = new Promise((resolve, reject) => {
        const { name, obj: suiteObj } = suite;

        const globals = generateGlobals(suiteObj);

        const filteredCollectionDefinition = filterCollection(collectionDefinition, suiteObj);

        const collection = new Collection(filteredCollectionDefinition);

        const runner = newman({
            collection,
            environment,
            globals,
            iterationCount,
            reporters
        });

        runner.on('beforeItem', (err, summary) => {
            guid = uuidv4();

            const s = suiteObj[summary.cursor.position];

            if (s[summary.item.name].data !== undefined) {
                const { data } = { ...s[summary.item.name] };

                let result = null;

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
                Object.assign(runner.summary,
                    createGlobalVariable(result, summary.cursor.position, runner.summary));
            }
        });

        runner.on('request', (err, summary) => {
            const { response } = summary;
            if (response !== undefined) {
                const buffer = response.stream;

                const variable = globals.values.members[summary.cursor.position].value;

                const result = summary.response.code === variable.code;

                const event = new Event({
                    listen: 'test',
                    script: new Script({
                        exec: format('tests["%s"] = %s',
                            guid,
                            result.toString())
                    })
                });

                summary.item.events.members.push(event);

                if (summary.response.code === variable.code && buffer.byteLength > 0) {
                    Object.assign(runner.summary,
                        createGlobalVariable(JSON.parse(buffer.toString()), summary.cursor.position, runner.summary));
                }
            }
        });

        runner.on('assertion', err => {
            if (err) {
                consoleColor = '\x1b[31m';
            }
        });

        runner.on('exception', err => {
            if (err) {
                consoleColor = '\x1b[31m';
                reject(runner.summary);
                throw err;
            }
        });

        runner.on('done', () => {
            console.log(`\x1b[0m\x1b[1m${consoleColor}`, `'Suite ${name} run complete!'`);

            resolve(runner.summary);
        });
    });

    return promises;
};
