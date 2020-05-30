const { define, create } = require('autofixture');
const { Collection } = require('postman-collection')
const { filterCollection } = require('../../lib/util/filterCollection');

jest.mock('fs');

describe('Test -> Util -> filterCollection', () => {
    it('Should return all items filted by suite', () => {
        define('CollectionDefinition', Object.getOwnPropertyNames(new Collection().toJSON()));

        const definition = create('CollectionDefinition', collectionDefinition => {
            collectionDefinition.item = [{ name: 'item1' }, { name: 'item2' }];

            return collectionDefinition;
        });

        const suites = [{ item1: null }];
        const result = filterCollection(definition, suites);

        expect(result.item).toEqual([{ name: 'item1' }]);
    });

    it('Should throw exception, if suite not contain valid request', () => {
        define('CollectionDefinition',Object.getOwnPropertyNames(new Collection().toJSON()));

        const definition = create('CollectionDefinition', collectionDefinition => {
            collectionDefinition.item = [{ name: 'item1' }, { name: 'item2' }];

            return collectionDefinition;
        });

        const suites = [];

        expect(() => {
            filterCollection(definition, suites);
        }).toThrow();
    });
});
