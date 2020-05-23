const { createGlobalVariable } = require("../../lib/util/createGlobalVariable");
const { define, create, createListOf } = require('autofixture');
const { Response } = require('postman-collection/lib/index');
const { VariableScope } = require('postman-collection/lib/collection/variable-scope').VariableScope;
require("newman/lib/run/options");



describe('Test -> Util -> createGlobalVariable', () => { 
    it('Should add new global variables', () => {
    
        const responseBody = {
            "b" : "c"
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

        const result = createGlobalVariable(responseBody, methodName, runSummary);

        expect(result.globals.values.members).toEqual(expected);
    })

    it('Should update global variables', () => {
    
        const responseBody = {
            "b" : "c"
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
                            "key": "b",
                            "type": "any",
                            value: "d" 
                        } 
                    ] 
                } 
            } 
        };

        const methodName = "Ping";

        const expected = Object.assign([], runSummary.globals.values.members);

        const a = Object.assign({}, expected.filter(x => x.key === "b")[0]);
        a.value = "c";

        expected.splice(expected.indexOf(a), 1);
        expected.push(a);

        const result = createGlobalVariable(responseBody, methodName, runSummary);

        expect(result.globals.values.members).toEqual(expected);
    })
});