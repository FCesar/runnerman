module.exports = {
    filterCollection: (collectionDefinition, suites)  => {
        const { item: allItems, ...everythingElse } = collectionDefinition;
        const filtredItems = allItems.filter(item =>
            item.name in suites);
        
        if(Array.isArray(filtredItems) && filtredItems.length == 0)
        {
            throw new Error("");
        }
        
        return Object.assign(everythingElse, { item: filtredItems });
    }
}