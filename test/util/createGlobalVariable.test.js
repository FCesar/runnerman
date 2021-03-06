const { createGlobalVariable } = require('../../lib/util/createGlobalVariable');
const { Variable } = require('postman-collection');

describe('Test -> Util -> createGlobalVariable', () => {
    it('Should add new global variables', () => {
        const responseBody = {
            b: 'c'
        };

        const runSummary = {
            globals: {
                values: {
                    members: [
                        new Variable({
                            key: 'Ping',
                            type: 'any',
                            value: { code: 200, map: ['b'] }
                        }),
                        new Variable({
                            key: 'HealthCheck',
                            type: 'any',
                            value: { code: 200 }
                        })
                    ]
                }
            }
        };

        const position = 0;

        const expected = Object.assign([], runSummary.globals.values.members);

        expected.push({ key: 'b', type: 'any', value: 'c' });

        const result = createGlobalVariable(responseBody, position, runSummary);

        expect(result.globals.values.members).toEqual(expected);
    });

    it('Should update global variables', () => {
        const responseBody = {
            b: 'c'
        };

        const runSummary = {
            globals: {
                values: {
                    members: [
                        new Variable({
                            key: 'Ping',
                            type: 'any',
                            value: { code: 200, map: ['b'] }
                        }),
                        new Variable({
                            key: 'b',
                            type: 'any',
                            value: 'd'
                        })
                    ]
                }
            }
        };

        const position = 0;

        const expected = Object.assign([], runSummary.globals.values.members);

        const a = Object.assign({}, expected.filter((x) => x.key === 'b')[0]);
        a.value = 'c';

        expected.splice(expected.indexOf(a), 1);
        expected.push(a);

        const result = createGlobalVariable(responseBody, position, runSummary);

        expect(result.globals.values.members).toEqual(expected);
    });
});
