const { isEmpty } = require('lodash');

const filterCollection = (collectionDefinition, suite) => {
    const { item: allItems, ...everythingElse } = collectionDefinition;
    const { name: suiteName, obj: suiteObj } = suite;
    const filteredItems = [];

    // TODO: Add new step in json suite - reflect this behaivor in test
    suiteObj.forEach(value => {
        const itemCollection = { ...allItems.find(item => item.name in value) };
        if (!isEmpty(itemCollection)) {
            filteredItems.push(itemCollection);
        }
    });

    if (isEmpty(filteredItems)) {
        throw new Error(`Suite file ${suiteName}, not provide a valid requests`);
    }

    return Object.assign(everythingElse, { item: filteredItems });
};

module.exports = { filterCollection };
