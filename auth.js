const _ = require('lodash');
const write = require('write');
const path = require('path');

exports.init = function (baseDir, defs) {
    let file =
        `const store = require('./store');

        let auth = {}

        `

    defs.authorizations.forEach((method) => {
        switch (method.type) {
            case 'token':
                file +=
                `
				auth.checkKey = function(token){
                    return new Promise(async (resolve, reject) => {
                        let r = await store.findKey(token)
						if(r){
							resolve()
						} else {
							reject("no match")
						}  
                    });
                }
				`

                break;
        }
    })

    // export as module
    file += "\nmodule.exports = auth;"

    write.sync(path.join(baseDir, "auth.js"), file, { newline: true });
}
