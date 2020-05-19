const _ = require('lodash');
const write = require('write');
var shell = require('shelljs');
const path = require('path');
const fs = require('fs');

const initialAppFileStruct = {
	importNewLine: 4,
	startOfReturnBlock: 6,
	endOfReturnBlock: 23
}

exports.init = function (reactAppBaseDir, defs){

	if (shell.exec('npm install react-router-dom').code !== 0) {
		shell.echo('Error: installing react-router-dom');
	}

	let file = readAppFileToArray(path.join(reactAppBaseDir, "src", "App.js"))

	addRouterImport(file)

	addComponentImport(file, defs)

	let routerSwitch = `<Router><Switch>${ addRoutes(file, defs) }</Switch></Router>`

	// adds router switch
	file.splice(initialAppFileStruct.endOfReturnBlock + 1, 0, routerSwitch)
	initialAppFileStruct.endOfReturnBlock++;

	//addRoutes(file, defs)

	updateAppFile(path.join(reactAppBaseDir, "src", "App.js"), file.join("\n"));

}

/* Internal functions */
function readAppFileToArray(appFilePath){
	var array = fs.readFileSync(appFilePath).toString().split("\n")

	return array;
}

function addRouterImport(file){
	file.splice(initialAppFileStruct.importNewLine - 1, 0, 'import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";')
	initialAppFileStruct.importNewLine++
}

function addComponentImport(file, defs) {
	defs.objects.forEach((obj) => {
		file.splice(initialAppFileStruct.importNewLine - 1, 0, `import ${_.capitalize(obj.name)} from './${_.capitalize(obj.name)}'`)
		initialAppFileStruct.importNewLine++

		if(obj.generateForm){
			file.splice(initialAppFileStruct.importNewLine - 1, 0, `import ${_.capitalize(obj.name)}Form from './${_.capitalize(obj.name)}Form'`)
			initialAppFileStruct.importNewLine++
		}
	})
}

function addRoutes(file, defs){
	let acc = "";
	defs.objects.forEach((obj) => {
		acc += 
			`
			<Route path="/${obj.name}s/:id" children={<${_.capitalize(obj.name)} />} />
			`

		if (obj.generateForm) {
			acc += 
			`
			<Route path="/${obj.name}/create" children={<${_.capitalize(obj.name)}Form />} />
			`
		}
	})

	return acc;
}

function updateAppFile(appFilePath, content){
	write.sync(appFilePath, content, { newline: true }); 
}
