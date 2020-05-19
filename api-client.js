const _ = require('lodash');
const write = require('write');
const path = require('path');

exports.init = function (reactAppBaseDir, defs){
    let endpoint = `${defs.server.protocol}://${defs.server.host}:${defs.server.port}/`
    
    let file = `/* API client */`

    // TODO: allow switching from fetch() to axios
    // TODO : handle other response statuses
    // configure global HTTP options
    file +=
        `
        let httpHeaders = new Headers({
            'Content-Type': 'application/json'
        });

        let endpoint = "${defs.server.protocol}://${defs.server.host}:${defs.server.port}/"
        `

    // create handlers
    defs.objects.forEach((obj) => {

        let resourceEndpoint = endpoint + obj.name + "/";

        // get
        file +=
            `
        exports.get${_.capitalize(obj.name)} = function (id){
            console.log(id)
			return new Promise((resolve, reject) => {
                const request = new Request("${resourceEndpoint}" + id, {method: 'GET'});
				fetch(request)
                .then(response => {
                    if (response.status === 200) {
                        return response.json();
                    } else {
                        reject('Something went wrong on api server!');
                    }
                })
                .then(response => {
                    resolve(response)
                }).catch(error => {
                    reject(error)
                });
			});
		}`

        // post 
        file +=
            `
        exports.create${_.capitalize(obj.name)} = function (data){
			return new Promise((resolve, reject) => {
                const request = new Request("${resourceEndpoint}", { method: 'POST', headers: httpHeaders, body: JSON.stringify(data) });
				fetch(request)
                .then(response => {
                    if (response.status === 200) {
                        return response.json();
                    } else {
                        reject('Something went wrong on api server!');
                    }
                })
                .then(response => {
                    resolve(response)
                }).catch(error => {
                    reject(error)
                });
			});
		}`

        // delete
        file +=
            `
        exports.delete${_.capitalize(obj.name)} = function (id){
			return new Promise((resolve, reject) => {
                const request = new Request("${resourceEndpoint}" + id, { method: 'DELETE' });
				fetch(request)
                .then(response => {
                    if (response.status === 200) {
                        return response.json();
                    } else {
                        reject('Something went wrong on api server!');
                    }
                })
                .then(response => {
                    resolve(response)
                }).catch(error => {
                    reject(error)
                });
			});
        }`

        // TODO : update

    })

    write.sync(path.join(reactAppBaseDir, "src", "apiClient.js"), file, { newline: true });
}
