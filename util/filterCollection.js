module.exports = {
    filterCollection: (collectionDefinition, suite)  => {
        const { item: allItems, ...everythingElse } = collectionDefinition;
        const filtredItems = allItems.filter(item =>
            item.name in suite);
        
        return Object.assign(everythingElse, { item: filtredItems });
    }
}