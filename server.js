const _ = require('lodash');
const write = require('write');
const path = require('path');

exports.init = function (baseDir, defs) {
	let file = 
	`
	const express = require('express')
	const cors = require('cors')
	const app = express()
	const passport = require('passport')
	const jwt = require('jsonwebtoken')


	app.use(cors())
	app.use(express.json())

	const store = require('./store.js')
	const auth = require('./auth.js')

	app.use(express.static(path.resolve(__dirname, '../', ${ defs.app.name }, '/build'));
	`

	// auth
	defs.authorizations.forEach((method) => {
		switch (method.type) {
			case 'token':
				file +=
				`
				// api authorization
				app.use("/api", async function (req, res, next) {
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
			case 'jwt':
				file += 
				`
				// web app authorization
				passport.use(new JWTstrategy({
					//secret we used to sign our JWT
					secretOrKey : 'top_secret',
					//we expect the user to send the token as a query parameter with the name 'secret_token'
					jwtFromRequest : ExtractJWT.fromUrlQueryParameter('secret_token')
					}, async (token, done) => {
					try {
						//Pass the user details to the next middleware
						return done(null, token.user);
					} catch (error) {
						done(error);
					}
				}));

				app.post('/login', async (req, res, next) => {
					passport.authenticate('login', async (err, user, info) => {     try {
						if(err || !user){
							const error = new Error('An Error occurred')
							return next(error);
						}
						req.login(user, { session : false }, async (error) => {
							if( error ) return next(error)
							const body = { _id : user._id, username : user.username };
							const token = jwt.sign({ user : body },'top_secret');
							return res.json({ token });
						});     
						} catch (error) {
							return next(error);
						}
					})(req, res, next);
				});
				`
		}
	})

	// create api endpoint for each object
	defs.objects.forEach((obj) => {
		file += 
		`\napp.get('/api/${obj.name}', async function (req, res) {
			// todo
		})`
		
		file += 
		`\napp.get('/api/${obj.name}/:id', async function (req, res) {
			store.getById${_.capitalize(obj.name)}(req.params.id).then(function(result) {
				res.status(200).json({"result": result})
			})
			.catch(function(err) {
				res.status(400).json({"error": err})
			});
			})
		`
		
		file += 
		`\napp.post('/api/${obj.name}', async function (req, res) {
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

function insertPassportMW(){
	return "passport.authenticate('jwt', { session: false })"
}