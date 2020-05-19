const _ = require('lodash');
const write = require('write');

let defs = require('./defs.json');

let file = 
`let fetchHeader = new Headers();
fetchHeader.append('Content-Type', 'application/json');

let methods = {
	get: {
		method: 'GET',
		headers: fetchHeader
	},
	post: {
		method: 'POST',
		headers: fetchHeader,
		body: ""
	},
	delete: {
		method: 'DELETE',
		headers: fetchHeader
	}
}

`

// create definitions for mongoose
defs.objects.forEach((obj) => {
	file += `let ${_.capitalize(obj.name)} = {`
	
	file += 
	`
	create: function(data){
					return new Promise((resolve, reject) => {
						fetch("${defs.store.protocol}://${defs.store.host}:${defs.store.port}/${obj.name}")
							.then(function(response) {
							  return response.json();
							})
							.then(function(payload) {
							  resolve(payload)
							})
							.catch(function(error) {
							  reject({"error": error})
							});
					});
					
				}
	`
})


// export as module
file += "\nmodule.exports = api;"

write.sync('./generated/api.js', file, { newline: true }); 