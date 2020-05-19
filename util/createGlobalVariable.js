const { Variable } = require("postman-collection");

module.exports = {
    createGlobalVariable: (response, methodName, summary) => {
        const buffer = response.stream;

        const variable = summary.globals.values.members
            .filter(x => x.key === methodName)[0].value;

        if (buffer.byteLength > 0 && variable.map !== undefined)
        {
            const response = JSON.parse(buffer.toString());

            for(const a in variable.map)
            {
                if(variable.map[a] in response)
                {
                    const value = response[variable.map[a]];
                    summary.globals.values.members.push(
                        new Variable({ 
                            "key": variable.map[a], 
                            "type": "any", 
                            "value": value 
                        })
                    );
                }
            }
        }
            
        return summary;
    }
}