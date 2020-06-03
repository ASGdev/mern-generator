const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const commandLineArgs = require('command-line-args')
const mongoose = require('mongoose');

const optionDefinitions = [
    { name: 'def', alias: 'd', type: String },
    { name: 'place', alias: 'p', type: String },
    { name: 'db', type: String, defaultValue: "nosql" },
    { name: 'reactrouting', type: String },
    { name: 'name', alias: 'n', type: String },
    { name: 'update', alias: 'u', type: Boolean }
]
const options = commandLineArgs(optionDefinitions)

try {
    defs = JSON.parse(fs.readFileSync(path.resolve(__dirname, options.def)).toString());
    console.log(defs)
} catch (error) {
    console.error(error);
    process.exit(-1)
}

console.log("Postinstall running")
console.log(options)

if (options.db === "sql") {
    
} else if (options.db === "nosql") {
    mongoose.connect('mongodb://localhost:27017/files', { useNewUrlParser: true, useUnifiedTopology: true });
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));

    var FileSchema = new mongoose.Schema({ name: String, creation: Date, md5sum: String, sha1sum: String, path: String, size: Number })
    var File = mongoose.model('File', FileSchema);
    var AuthApiKeySchema = new mongoose.Schema({ apikey: String })
    var AuthApiKey = mongoose.model('AuthApiKey', AuthApiKeySchema)

    for (const method of defs.authorizations) {   
        switch (method.type) {
            case 'token':
                for (const token of method.tokens) {
                    console.log("[Store] Adding token " + token)
                    insertToken(token).then(() => console.log("... token inserted")).catch((e) => { console.log(e) })
                }
                
                break;
        }
    }

} else {
    console.log("- no store installed");
}

process.exit(0)


async function insertToken(token){
    return new Promise((resolve, reject) => {
        let o = new AuthApiKey();
        o.apikey = token
        o.save(function (err) {
            if (err) {
                console.log(err)
                reject(err)
            } else {
                resolve()
            }
        });
    });
}
