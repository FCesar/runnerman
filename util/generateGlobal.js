module.exports = {
    

    generateGlobals: suite => {
        const values = [];

        const globals = {
            "id": "50f0331c-45be-4c45-8df9-75b70d27e1e9",
            "values": [],
            "name": "My Workspace Globals",
            "_postman_variable_scope": "globals",
            "_postman_exported_at": "2020-05-11T17:50:30.198Z",
            "_postman_exported_using": "Postman/7.22.1"
        };

        for (const [k, v] of Object.entries(suite)) {
            const value = {
                "key": null,
                "value": null,
                "enabled": true
            };

            values.push(Object.assign(value, {"key": k, "value": v}));
        }

        return Object.assign(globals, { values: values })
    }
}