const { Collection, Event, Script } = require('postman-collection')
const { run: newman } = require('newman');
const { filterCollection } = require('./util/filterCollection');
const { generateGlobals } = require('./util/generateGlobal');
const { format } = require("util");
const { createGlobalVariable } = require("./util/createGlobalVariable");
const { v4: uuidv4 } = require('uuid');


module.exports = async function (suite, collectionDefinition, environment, iterations) {

    let guid = null;

    const promises = new Promise((resolve, reject) => {
        
        const name = suite.name;

        const suiteObj = suite.obj;

        const globals = generateGlobals(suiteObj);

        const filteredCollectionDefinition = filterCollection(collectionDefinition, suiteObj);

        const collection = new Collection(filteredCollectionDefinition);

        const runner = newman({
            collection: collection,
            environment: environment,
            globals: globals,
            iterationCount: iterations,
            reporters: [ 'cli' ]
        });

        runner.on('beforeItem', function(err, summary) {
            guid = uuidv4();
            
            let i = Object.assign(summary.cursor.position);

            ++i;

            const suite = suiteObj[format("step_%s", i.toString())]
            
            if(suite[summary.item.name].data !== undefined)
            {
                var data = Object.assign({}, suite[summary.item.name].data);

                if (typeof data === "function")
                {
                    data = data(err, summary, runner.summary);
                }else{
                    Object.entries(data).forEach(([key, value]) => {
                        if (typeof value === "function")
                        {
                            const newObj = new Object();
                            newObj[key] = value(err, summary, runner.summary);

                            Object.assign(data, newObj);
                        }
                    });
                }

                //TODO: Remover this variables in "item"
                Object.assign(runner.summary,
                    createGlobalVariable(data, summary.cursor.position, runner.summary));
            }
        });

        runner.on('request', function (err, summary) {
            const response = summary.response;
            if (response !== undefined)
            {
                const buffer = response.stream;

                const variable = globals.values.members[summary.cursor.position].value;

                const event = new Event({
                    listen: 'test',
                    script: new Script({
                    exec: format('tests["%s"] = %s',
                        guid,
                        new Boolean(summary.response.code === variable.code).toString())
                    })
                });

                summary.item.events.members.push(event);

                if (summary.response.code === variable.code && buffer.byteLength > 0)
                {
                    Object.assign(runner.summary,
                        createGlobalVariable(JSON.parse(buffer.toString()), summary.cursor.position, runner.summary));
                }
            }
        });

        runner.on('assertion', function (err, summary) {
            if (err){
                assert = 1;
            }
        });

        runner.on('exception', function (err) {
            if (err) {
                reject(runner);
                assert = 1;
                throw err;
            }
        });

        runner.on('done', function (err, summary) {
            console.log(format('Suite %s run complete!', name));
            resolve(runner);
        });
    });
    
    return promises;
}
