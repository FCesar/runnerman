const { createGlobalVariable } = require("../../util/createGlobalVariable");
const { define, create, createListOf } = require('autofixture');
const { Response } = require('postman-collection/lib/index');
const { VariableScope } = require('postman-collection/lib/collection/variable-scope').VariableScope;
require("newman/lib/run/options");



describe('Test -> Util -> createGlobalVariable', () => { 
    it('Should add new global variables', () => {
    
        const responseBody = "{ \"b\": \"c\" }";

        let b = Buffer.from(responseBody, 'utf-8');

        const responseDefinition = {
            "stream" : b
        };

        const runSummary = { 
            "globals" : { 
                "values" : { 
                    "members" : [ 
                        { 
                            "key": "Ping",
                            "type": "any",
                            value: { "code": 200, "map": ["b"] } 
                        },
                        { 
                            "key": "HealthCheck",
                            "type": "any",
                            value: { "code": 200 } 
                        } 
                    ] 
                } 
            } 
        };

        const methodName = "Ping";

        const expected = Object.assign([], runSummary.globals.values.members);

        expected.push({ "key": "b", "type": "any", "value": "c" });

        const result = createGlobalVariable(responseDefinition, methodName, runSummary);

        expect(result.globals.values.members).toEqual(expected);
    })
});