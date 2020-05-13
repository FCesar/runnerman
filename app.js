#!/usr/bin/env node

const { parseJsonFile } = require('./util/parseJsonFile')
const { Collection } = require('postman-collection')
const { run: newman } = require('newman');
const { program } = require('commander');
const { filterCollection } = require('./util/filterCollection');
const { generateGlobals } = require('./util/generateGlobal');
const { getFilesInFolderPerExtension } = require("./util/getFilesInFolderPerExtension");
const { format } = require("util");
const { Mutex } = require('async-mutex');


program
  .version('0.0.1')
  .option('-c, --collection <type>')
  .option('-e, --environment <type>')
  .option('-s, --suite <type>')
  .parse(process.argv);

if (program.collection === '' ||
  program.environment === '' ||
  program.suite === '')
{
  program.help();
}

const collectionDefinition = parseJsonFile(program.collection);

const environment = parseJsonFile(program.environment);

const suites = getFilesInFolderPerExtension(program.suite, "suite");

const mutex = new Mutex();

suites.forEach(suite => {
  mutex.acquire().then(function(release) {
    const name = suite;
    suite = parseJsonFile(suite);

    const globals = generateGlobals(suite);

    filteredCollectionDefinition = filterCollection(collectionDefinition, suite);

    const collection = new Collection(filteredCollectionDefinition).toJSON();

    newman({
        collection: collection,
        environment: environment,
        globals: globals,
        reporters: [ 'cli' ]
    }, function (err, summary) {
        if (err) { throw err; }
        console.log(format('Suite %s run complete!', name));
    }).on('beforeTest', function (err, summary) {
        var arr = new Array();
        arr[0] = "var config = pm.globals.get(pm.info.requestName);";
        arr[1] = "if(config !== undefined)";
        arr[2] = "{";
        arr[3] = "    pm.test(\"Status test\", function () {";
        arr[4] = "        pm.response.to.have.status(config);";
        arr[5] = "    });";
        arr[6] = "}";
        summary.item.events.members.find(element => element.listen == "test").script.exec = summary.item.events.members.find(element => element.listen == "test").script.exec.concat(arr);
    }).on('done', function (err, summary) {
        release();
    });
  });
});