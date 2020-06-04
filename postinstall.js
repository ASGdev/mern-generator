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
    populateNoSql();

} else {
    console.log("- no store installed");
}


async function populateNoSql(){
        mongoose.connect(`mongodb://${defs.store.host}:${defs.store.port}/${defs.store.name}`, { useNewUrlParser: true, useUnifiedTopology: true });
        var db = mongoose.connection;
        db.on('error', console.error.bind(console, 'MongoDB connection error:'));

        var AuthApiKeySchema = new mongoose.Schema({ apikey: String })
        var AuthApiKey = mongoose.model('AuthApiKey', AuthApiKeySchema)

        for (const method of defs.authorizations) {
            switch (method.type) {
                case 'token':
                    for (const token of method.tokens) {
                        console.log("[Store] Adding token " + token)
                        try {
                            await insertToken(token, AuthApiKey)
                        } catch (e) {
                            console.log(e)
                        }
                    }

                    break;
            }
        }

        process.exit(0)
}

async function insertToken(token, AuthApiKey){
    let o = new AuthApiKey()
    o.apikey = token
    await o.save()
}
