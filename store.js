const _ = require('lodash');
const write = require('write');
const path = require('path');

exports.init = function (baseDir, defs){
	let file =
		`const mongoose = require('mongoose');
		mongoose.connect('mongodb://${defs.store.host}:${defs.store.port}/${defs.store.name}', {useNewUrlParser: true, useUnifiedTopology: true});

		var db = mongoose.connection;

		db.on('error', console.error.bind(console, 'MongoDB connection error:'));

		let store = {}

		`

	// create definitions for mongoose
	defs.objects.forEach((obj) => {
		console.log(JSON.stringify(obj.props))

		file += `\nvar ${_.capitalize(obj.name)}Schema = new mongoose.Schema(${ JSON.stringify(obj.props).replace(/\"/g, "") })`

		/*for (let [key, type] of Object.entries(obj.props)) {
			file += `${key}: ${_.capitalize(type)},`;
		}

		file += "});"*/

		file += `\nvar ${_.capitalize(obj.name)} = mongoose.model('${_.capitalize(obj.name)}', ${_.capitalize(obj.name)}Schema);`
	})

	defs.authorizations.forEach((method) => {
		switch (method.type) {
			case 'token':
				file += 
				`
				var AuthApiKeySchema = new mongoose.Schema({ apikey: String })
				var AuthApiKey = mongoose.model('AuthApiKey', AuthApiKeySchema)

				store.findKey = async function (key){
					try {
						let doc = await AuthApiKey.find({ apikey: key });
						if(doc.length === 1){
							if(doc[0].apikey == key){
								return true;
							} else {
								return false;
							}
						} else {
							return false
						}
						

					} catch (err){
						console.log(err)
						return false
					}
				}

				store.addKey = function(token){
                    return new Promise((resolve, reject) => {
						console.log("[Store] Adding token " + token)
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
				`

				break;
			case 'jwt':
				console.log("selected jwt auth")
				file += 
				`
				const UserSchema = new Schema({
					username : {
						type : String,
						required : true,
						unique : true
					},
					password : {
						type : String,
						required : true
					}
				});
				var User = mongoose.model('User', UserSchema)

				store.getUserPassword = async function (username){
					try {
						let doc = await User.find({ username });
						if(doc.length === 1){
							if(doc[0].username == username){
								return doc[0].password
							} else {
								return ""
							}
						} else {
							return ""
						}
						

					} catch (err){
						console.log(err)
						return ""
					}
				}

				store.findUser = async function (username){
					try {
						let doc = await User.find({ username });
						if(doc.length === 1){
							if(doc[0].username == username){
								return doc[0]
							} else {
								return ""
							}
						} else {
							return ""
						}
						

					} catch (err){
						console.log(err)
						return ""
					}
				}
				`
		}
	})

	// create handlers
	defs.objects.forEach((obj) => {
		// insert
		file +=
			`
	store.create${_.capitalize(obj.name)} = function (data){
			return new Promise((resolve, reject) => {
				let o = new ${_.capitalize(obj.name)}(data)
				o.save(function (err) {
					if (err) {
						reject(err)
					} else {
						resolve()
					}
				});
			});
		}`

		// get all - TODO
		file +=
			`
	store.get${_.capitalize(obj.name)} = function (id){
			return new Promise((resolve, reject) => {
				${_.capitalize(obj.name)}.findById(id, function (err, o) {
					if (err) {
						reject(err)
					} else {
						resolve(o)
					}
				});
			});
		}`

		// get by ID
		file +=
			`
	store.getById${_.capitalize(obj.name)} = function (id){
			return new Promise((resolve, reject) => {
				${_.capitalize(obj.name)}.findById(id, function (err, o) {
					if (err) {
						reject(err)
					} else {
						resolve(o)
					}
				});
			});
		}`

		// delete by filter -- should not be used as not completely implemented here
		file +=
			`
	store.delete${_.capitalize(obj.name)} = function (filter){
			return new Promise((resolve, reject) => {
				${_.capitalize(obj.name)}.deleteOne(filter, function (err) {
					if (err) {
						reject(err)
					} else {
						resolve()
					}
				});
			});
		}`

		// delete by ID shortcut
		file +=
			`
	store.deleteById${_.capitalize(obj.name)} = function (id){
			return new Promise((resolve, reject) => {
				${_.capitalize(obj.name)}.findByIdAndDelete(id, function (err) {
					if (err) {
						reject(err)
					} else {
						resolve()
					}
				});
			});
		}`

		// update by ID
		file +=
			`
	store.updateById${_.capitalize(obj.name)} = function (id){
			return new Promise((resolve, reject) => {
				${_.capitalize(obj.name)}.findByIdAndUpdate(id, function (err) {
					if (err) {
						reject(err)
					} else {
						resolve()
					}
				});
			});
		}`

	})

	// export as module
	file += "\nmodule.exports = store;"

	write.sync(path.join(baseDir, "store.js"), file, { newline: true }); 
}
