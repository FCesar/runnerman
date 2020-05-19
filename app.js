#!/usr/bin/env node

const { parseJsonFile } = require('./util/parseJsonFile')
const { Collection, Event, Script } = require('postman-collection')
const { run: newman } = require('newman');
const { program } = require('commander');
const { filterCollection } = require('./util/filterCollection');
const { generateGlobals } = require('./util/generateGlobal');
const { getFilesInFolderPerExtension } = require("./util/getFilesInFolderPerExtension");
const { format } = require("util");
const { Mutex } = require('async-mutex');
const { createGlobalVariable } = require("./util/createGlobalVariable");
const { v4: uuidv4 } = require('uuid');


program
  .version('0.0.1')
  .option('-c, --collection <type>')
  .option('-e, --environment <type>')
  .option('-s, --suite <type>')
  .option('-i, --iterations <type>')
  .parse(process.argv);

if (program.collection === '' ||
  program.environment === '' ||
  program.suite === '')
{
  program.help();
}

(async function main() {
  const collectionDefinition = parseJsonFile(program.collection);

  const environment = parseJsonFile(program.environment);

  const suites = getFilesInFolderPerExtension(program.suite, "suite");

  const iterations = parseInt(program.iterations) || 1;

  const mutex = new Mutex();

  let guid = null;

  let assert = 0;

  const promises = suites.map(async (suite) => {
    await new Promise((resolve, reject) => {
      mutex.acquire().then(function(release) {

        const name = suite;
    
        const suiteObj = parseJsonFile(suite);
    
        const globals = generateGlobals(suiteObj);
    
        filteredCollectionDefinition = filterCollection(collectionDefinition, suiteObj);
    
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
        });
    
        runner.on('request', function (err, summary) {
          const response = summary.response;
          if (response !== undefined)
          {
            const variable = globals.values
              .filter(x => x.key === summary.item.name)[0].value;
    
            Object.assign(this.summary, createGlobalVariable(response, summary.item.name, this.summary));
    
            const rawEvent = {
                listen: 'test',
                script: new Script({
                  exec: format('tests["%s"] = %s', guid, new Boolean(summary.response.code === variable.code).toString())
                })
            };
    
            summary.item.events.members.push(new Event(rawEvent));
          }
        });
    
        runner.on('assertion', function (err, summary) {
          if (err) { assert = 1 }
        });
    
        runner.on('exception', function (err, summary) {
          release();
          reject();
          if (err) { throw err; }
        });
    
        runner.on('done', function (err, summary) {
          release();
          console.log(format('Suite %s run complete!', name));
          resolve()
        });
      })
    })
  });

  await Promise.all(promises)

  process.exit(assert);
})();
