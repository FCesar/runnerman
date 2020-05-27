# Runnerman
___

A simple way test your apis.

### Command

```javascript
runnerman -c <your collection> -e <your enviroment> -s <your suite> -i <optinal interation count>
```

### Suite
1. Test Post is a name of request in collection.
2. Code is a status code expected for request.
3. Map get value in response and create a single variable in scope collection
```javascript
[
	{ "Test Post": { "code": 200, "map": ["json"] } }
]
```