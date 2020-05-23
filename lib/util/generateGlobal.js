const { Variable, VariableScope } = require("postman-collection");

module.exports = {
    generateGlobals: (suite) => {
        const variableScope = new VariableScope();

        for (const [key, value] of Object.entries(suite)) {
            const variable = new Variable({
                "key": key,
                "value": value
            });

            variableScope.values.members.push(variable);
        }

        return variableScope;
    }
}