const _ = require('lodash');
const write = require('write');
const path = require('path');

exports.init = function (baseDir, defs) {
	let file = 
	`
	const express = require('express')
	const cors = require('cors')
	const app = express()

	app.use(cors())
	app.use(express.json())

	const store = require('./store.js')
	const auth = require('./auth.js')
	`

	// auth
	defs.authorizations.forEach((method) => {
		switch (method.type) {
			case 'token':
				file +=
				`
				app.use(async function (req, res, next) {
					let token = req.body.apikey || req.query.api_key || null;
					console.log('Req token :', token)
					// also check http header for get
					if(token === null){
						res.status(401).json({"error":"Token not authorized"})
					} else {
						auth.checkKey(token).then(() => {
							next()
						}).catch((e) => {
							res.status(401).json({"error":"Token not authorized"})
						})
					}
				})
				`

				break;
		}
	})

	// create endpoint for each object
	defs.objects.forEach((obj) => {
		file += 
		`\napp.get('/${obj.name}', async function (req, res) {
			// todo
		})`
		
		file += 
		`\napp.get('/${obj.name}/:id', async function (req, res) {
			store.getById${_.capitalize(obj.name)}(req.params.id).then(function(result) {
				res.status(200).json({"result": result})
			})
			.catch(function(err) {
				res.status(400).json({"error": err})
			});
			})
		`
		
		file += 
		`\napp.post('/${obj.name}', async function (req, res) {
			store.create${_.capitalize(obj.name)}(req.body).then(function(result) {
				res.status(200).json({"result": result})
			})
			.catch(function(err) {
				res.status(400).json({"error": err})
			});
			})
		`
		
	})

	file +=
	`\napp.listen(${defs.server.port}, function () {
	console.log('Backend listening on port ${defs.server.port}')
	})`

	write.sync(path.join(baseDir, "server.js"), file, { newline: true }); 
}
