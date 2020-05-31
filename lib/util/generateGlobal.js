const { Variable, VariableScope } = require('postman-collection');

module.exports = {
    generateGlobals: (suite) => {
        const variableScope = new VariableScope();

        //TODO: Add new step in json suite - reflect this behaivor in test
        for (const step of suite) {
            for (const [key, value] of Object.entries(step)) {
                const variable = new Variable({
                    key: key,
                    value: value
                });
                variableScope.values.members.push(variable);
            }
        }

        return variableScope;
    }
};
