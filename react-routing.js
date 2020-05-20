const _ = require('lodash');
const write = require('write');
var shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const { default: generate } = require("@babel/generator");
require("@babel/core").transform("code", {
	presets: ["@babel/preset-react"],
});
const parser = require("@babel/parser");


const initialAppFileStruct = {
	importNewLine: 4,
	startOfReturnBlock: 6,
	endOfReturnBlock: 23
}

exports.init = function (reactAppBaseDir, defs){

	let file = readAppFile(path.join(reactAppBaseDir, "src", "App.js"))

	let p = parser.parse(file, {
		sourceType: "module",
		plugins: [
			"jsx",
			"flow"
		]
	});

	addRouterImport(p)

	addComponentImport(p, defs)

	p.program.body.forEach((node) => {
		
		if (node.type ===  'FunctionDeclaration'){
			node.body.body[0].argument.children.length = 0
			node.body.body[0].argument.openingElement.attributes.length = 0;

			let routerSwitch = `<Router>${addMenu(defs)}<Switch>${addRoutes(defs)}</Switch></Router>`

			let ne = parser.parse(routerSwitch, { plugins: ["jsx", "flow"] })

			node.body.body[0].argument.children.push(ne.program.body[0].expression)
		}
	})

	const output = generate(p, {}, null)

	updateAppFile(path.join(reactAppBaseDir, "src", "App.js"), output.code)

	if (shell.exec('npm install react-router-dom').code !== 0) {
		shell.echo('Error: installing react-router-dom');
	}

}

/* Internal functions */
function readAppFile(appFilePath){
	return fs.readFileSync(appFilePath).toString();
}

function addRouterImport(file){
	let ne = parser.parse('import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";', { sourceType: "module", plugins: ["jsx", "flow"] })

	file.program.body.splice(3, 0, ne.program.body[0])
}

function addComponentImport(file, defs) {
	let importIndex = 3
	defs.objects.forEach((obj) => {
		let ne = parser.parse(`import ${_.capitalize(obj.name)} from './${_.capitalize(obj.name)}'`, { sourceType: "module", plugins: ["jsx", "flow"] })
		file.program.body.splice(++importIndex, 0, ne.program.body[0])

		if(obj.generateForm){
			let ne = parser.parse(`import ${_.capitalize(obj.name)}Form from './${_.capitalize(obj.name)}Form'`, { sourceType: "module", plugins: ["jsx", "flow"] })
			file.program.body.splice(++importIndex, 0, ne.program.body[0])
		}
	})
}

function addRoutes(defs){
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

function addMenu(defs) {
	let acc = "<h2>Accounts</h2><ul>";
	defs.objects.forEach((obj) => {
		acc +=
			`
			<li><Link to="/${obj.name}s/:id">View ${obj.name} with id :id</Link></li>
			`

		if (obj.generateForm) {
			acc +=
			`
			<li><Link to="/${obj.name}/create">Create ${obj.name}</Link></li>`
		}
	})

	return acc + "</ul>";

}

function updateAppFile(appFilePath, content){
	write.sync(appFilePath, content, { newline: true }); 
}
