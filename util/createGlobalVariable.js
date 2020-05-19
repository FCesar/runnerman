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
                    
                    const members = summary.globals.values.members;
                    
                    if (members.filter(x => x.key === variable.map[a]).length == 0)
                    {
                        members.push(
                            new Variable({ 
                                "key": variable.map[a], 
                                "type": "any", 
                                "value": value 
                            })
                        );
                    }else{
                        members.filter(x => x.key === variable.map[a])[0].value = value;
                    }
                }
            }
        }
            
        return summary;
    }
}