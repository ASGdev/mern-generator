const commandLineArgs = require('command-line-args')
var shell = require('shelljs');
const path = require('path');
const fs = require('fs');
var childProcess = require("child_process");

let baseDir = ""
let defs = {}

const DEFAULT_PACKAGES = []

const reactRoutingGenerator = require('./react-routing')
const reactComponentGenerator = require('./react-component')
const reactApiClient = require('./api-client')
const reactFormComponentGenerator = require('./react-component-form')

const storeGenerator = require('./store')
const serverGenerator = require('./server')
const authGenerator = require('./auth')

const optionDefinitions = [
	{ name: 'def', alias:'d', type: String },
	{ name: 'place', alias: 'p', type: String },
	{ name: 'db', type: String, defaultValue: "nosql"  },
	{ name: 'reactrouting', type: String },
	{ name: 'name', alias: 'n', type: String },
	{ name: 'update', alias: 'u', type: Boolean }
]
const options = commandLineArgs(optionDefinitions)

baseDir = options.place

try {
	defs = JSON.parse(fs.readFileSync(options.def).toString());

	console.log(defs)
} catch (error) {
	console.error(error);
	process.exit(-1)
}

if(!path.isAbsolute(baseDir)){
	baseDir = path.resolve(baseDir)
}
shell.cd(baseDir);

console.log("+ installing react")
let appName = defs.app.name
if(options.name){
	appName = options.name
}

if(!options.update){
	if (shell.exec('npx create-react-app ' + appName).code !== 0) {
	shell.echo('Error: installing react app "' + appName + '" failed');
	}
}

shell.echo('+ updating react app files');

let reactAppBaseDir = path.join(baseDir, defs.app.name)

shell.cd(reactAppBaseDir);

reactRoutingGenerator.init(reactAppBaseDir, defs)
reactComponentGenerator.init(reactAppBaseDir, defs)
reactApiClient.init(reactAppBaseDir, defs)
reactFormComponentGenerator.init(reactAppBaseDir, defs)

shell.cd(baseDir);
shell.mkdir("backend")

let backendAppBaseDir = path.join(baseDir, "backend")

shell.cd(backendAppBaseDir)

if (!options.update) {
	if (shell.exec('npm init -f').code !== 0) {
		shell.echo('Error: installing package.json');
	}

	console.log("+ installing express")
	if (shell.exec('npm i express').code !== 0) {
	shell.echo('Error: installing express failed');
	}

	console.log("+ installing cors for express")
	if (shell.exec('npm i cors').code !== 0) {
	shell.echo('Error: installing express failed');
	}

	if(options.db === "sql"){
		console.log("+ installing sequelize")
		if (shell.exec('npm i sequelize').code !== 0) {
		shell.echo('Error: installing sequelize failed');
		}
	} else if(options.db === "nosql"){
		console.log("+ installing mongoose")
		if (shell.exec('npm i mongoose').code !== 0) {
		shell.echo('Error: installing mongoose failed');
		}

	} else {
		console.log("- no store installed");
	}
}

console.log("+ creating store file")
storeGenerator.init(backendAppBaseDir, defs)

console.log("+ creating server file")
serverGenerator.init(backendAppBaseDir, defs)

console.log("+ creating auth file")
authGenerator.init(backendAppBaseDir, defs)

console.log("+ postinstall")
var cp = childProcess.fork(path.join(__dirname, "postinstall.js"), ["-d", options.def]);
cp.on("exit", function (code, signal) {
	console.log("Exited", { code: code, signal: signal });
	console.log("==== FINISHED ====")
	process.exit(0)

});
cp.on("error", console.error.bind(console));