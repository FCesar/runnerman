const { _ } = require('lodash');

const filterCollection = (collectionDefinition, suite) => {
    const { item: allItems, ...everythingElse } = collectionDefinition;
    const { name: suiteName, obj: suiteObj } = suite;
    const filtredItems = [];

    // TODO: Add new step in json suite - reflect this behaivor in test
    suiteObj.forEach(value => {
        const itemCollection = { ...allItems.find(item => item.name in value) };
        if (!_.isEmpty(itemCollection)) {
            filtredItems.push(itemCollection);
        }
    });

    if (_.isEmpty(filtredItems)) {
        throw new Error(`Suite file ${suiteName}, not provide a valid requests`);
    }

    return Object.assign(everythingElse, { item: filtredItems });
};

module.exports = { filterCollection };
