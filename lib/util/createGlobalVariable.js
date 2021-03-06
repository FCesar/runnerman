const { Variable } = require('postman-collection');

module.exports = {
    //TODO: Change search per postion - reflect this behaivor in test
    createGlobalVariable: (response, position, summary) => {
        const variable = summary.globals.values.members[position].value;

        if (variable.map !== undefined) {
            for (const a in variable.map) {
                const item = variable.map[a];

                if (item in response) {
                    const value = response[item];

                    const members = summary.globals.values.members;

                    const member = members.find((x) => x.key === item);

                    if (member == undefined) {
                        members.push(
                            new Variable({
                                key: item,
                                type: 'any',
                                value: value
                            })
                        );
                    } else {
                        Object.assign(member, { value: value });
                    }
                }
            }
        }

        return summary;
    }
};
