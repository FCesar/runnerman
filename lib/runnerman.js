const { Collection, Event, Script } = require('postman-collection');
const { run: newman } = require('newman');
const { format } = require('util');
const { v4: uuidv4 } = require('uuid');
const { filterCollection } = require('./util/filterCollection');
const { generateGlobals } = require('./util/generateGlobal');
const { createGlobalVariable } = require('./util/createGlobalVariable');

module.exports = async function runnerman(suite, collectionDefinition, environment, iterations) {
    let guid = null;

    const promises = new Promise((resolve, reject) => {
        const { name, obj: suiteObj } = suite;

        const globals = generateGlobals(suiteObj);

        const filteredCollectionDefinition = filterCollection(collectionDefinition, suiteObj);

        const collection = new Collection(filteredCollectionDefinition);

        const runner = newman({
            collection,
            environment,
            globals,
            iterationCount: iterations,
            reporters: ['cli']
        });

        runner.on('beforeItem', (err, summary) => {
            guid = uuidv4();

            const suitePosition = suiteObj[summary.cursor.position];

            if (suitePosition[summary.item.name].data !== undefined) {
                const { data } = { ...suitePosition[summary.item.name] };

                let result = Object.create();

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
                Object.assign(runner.summary, createGlobalVariable(result, summary.cursor.position, runner.summary));
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
                        exec: format(
                            'tests["%s"] = %s',
                            guid,
                            result.toString()
                        )
                    })
                });

                summary.item.events.members.push(event);

                if (summary.response.code === variable.code && buffer.byteLength > 0) {
                    Object.assign(
                        runner.summary,
                        createGlobalVariable(JSON.parse(buffer.toString()), summary.cursor.position, runner.summary)
                    );
                }
            }
        });

        runner.on('exception', err => {
            if (err) {
                reject(runner.summary);
                throw err;
            }
        });

        runner.on('done', () => {
            console.log(format('Suite %s run complete!', name));
            resolve(runner.summary);
        });
    });

    return promises;
};
