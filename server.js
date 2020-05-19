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
	`

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
