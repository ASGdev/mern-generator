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
            case 'jwt':
                file +=
                `
                const passport = require('passport');
                const localStrategy = require('passport-local').Strategy;
                const JWTstrategy = require('passport-jwt').Strategy;
                const ExtractJWT = require('passport-jwt').ExtractJwt;
                const bcrypt = require('bcrypt');
                
                auth.validatePassword = async function(user, password){
                    let dbpassword = await store.getUserPassword()
                    const compare = await bcrypt.compare(password, dbpassword);
                    return compare;
                }
                
                auth.createUser = async function(username, password){

                }

                passport.use('signup', new localStrategy({
                    usernameField : 'username',
                    passwordField : 'password'
                }, async (username, password, done) => {
                    try {
                        const user = await store.createUser({ username, password });
                        return done(null, user);
                    } catch (error) {
                    done(error);
                    }
                }));

                passport.use('login', new localStrategy({
                    usernameField : 'username',
                    passwordField : 'password'
                }, async (username, password, done) => {
                    try {
                        const user = await store.findUser({ username });
                        if( !user ){
                            return done(null, false, { message : 'User not found'});
                        }
                        const validate = await auth.validatePassword(password);
                        if( !validate ){
                            return done(null, false, { message : 'Wrong Password'});
                        }
                        return done(null, user, { message : 'Logged in Successfully'});
                    } catch (error) {
                        return done(error);
                    }
                }));
                
                //This verifies that the token sent by the user is valid
                passport.use(new JWTstrategy({
                    secretOrKey : 'top_secret',
                    jwtFromRequest : ExtractJWT.fromUrlQueryParameter('secret_token')
                }, async (token, done) => {
                try {
                    return done(null, token.user);
                } catch (error) {
                    done(error);
                }
                }));
                `
        }
    })

    // export as module
    file += "\nmodule.exports = auth;"

    write.sync(path.join(baseDir, "auth.js"), file, { newline: true });
}
