const { Collection, Event, Script } = require('postman-collection')
const { run: newman } = require('newman');
const { filterCollection } = require('./util/filterCollection');
const { generateGlobals } = require('./util/generateGlobal');
const { format } = require("util");
const { Mutex } = require('async-mutex');
const { createGlobalVariable } = require("./util/createGlobalVariable");
const { v4: uuidv4 } = require('uuid');

module.exports = async function (suites, collectionDefinition, environment, iterations) {
    const mutex = new Mutex();

    let guid = null;

    let assert = 0;

    const promises = suites.map(async (suite) => {
        await new Promise((resolve, reject) => {
            mutex.acquire().then(function(release) {
        
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
        
                if(suiteObj[summary.item.name].data !== undefined)
                {
                    //TODO: Remover this variables in "item"
                    Object.assign(this.summary,
                    createGlobalVariable(suiteObj[summary.item.name].data, summary.item.name, this.summary));
                }
                });
        
                runner.on('request', function (err, summary) {
                const response = summary.response;
                if (response !== undefined)
                {
                    const buffer = response.stream;
        
                    const variable = globals.values
                    .filter(x => x.key === summary.item.name)[0].value;
            
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
                    Object.assign(this.summary,
                        createGlobalVariable(JSON.parse(buffer.toString()), summary.item.name, this.summary));
                    }
                }
                });
            
                runner.on('assertion', function (err) {
                    if (err){
                        assert = 1;
                    }
                });
            
                runner.on('exception', function (err) {
                    if (err) {
                        release();
                        reject();
                        assert = 1;
                        throw err;
                    }
                });
            
                runner.on('done', function (err, summary) {
                    release();
                    console.log(format('Suite %s run complete!', name));
                    resolve();
                });
            })
        })
    });
    
    await Promise.all(promises);

    return assert;
}
