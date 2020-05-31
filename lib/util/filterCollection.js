module.exports = {
    filterCollection: (collectionDefinition, suites) => {
        const { item: allItems, ...everythingElse } = collectionDefinition;
        const filtredItems = [];

        // TODO: Add new step in json suite - reflect this behaivor in test
        suites.forEach(value => {
            const itemCollection = { ...allItems.find(item => item.name in value) };
            filtredItems.push(itemCollection);
        });

        if (Array.isArray(filtredItems) && filtredItems.length === 0) {
            throw new Error('');
        }

        return Object.assign(everythingElse, { item: filtredItems });
    }
};
