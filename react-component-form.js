const _ = require('lodash');
const write = require('write');
var shell = require('shelljs');
const path = require('path');
const fs = require('fs');

exports.init = function (reactAppBaseDir, defs) {

    defs.objects.forEach((obj) => {

        if(obj.generateForm){
        
            let reactStateLiteral = {
                getter: `${obj.name}Form`,
                setter: `set${_.capitalize(obj.name)}Form`
            }

            let component =
                `
                import React, { useState, useEffect } from 'react';
            import logo from './logo.svg';
            import './App.css';
            import { useParams } from "react-router-dom";
            import * as ApiClient from './apiClient'

            function ${_.capitalize(obj.name)}Form() {
                let { id } = useParams();
                const [ ${reactStateLiteral.getter}, ${reactStateLiteral.setter} ] = useState({});

                const handleSubmit = (e) => {
                    e.preventDefault();

                    ApiClient.create${_.capitalize(obj.name)}(${reactStateLiteral.getter})
                        .then((data) => console.log(data))
                        .catch((e) => console.log(e))
                }

                const handleChange = (n, v) => {
                    let state = fileForm;
					state[n] = v;
					setFileForm(state)
                }

                return (
                    <div>
                        ${ setForm(obj.props)}
                    </div>
                );
            }

            export default ${_.capitalize(obj.name)}Form;
            `

            write.sync(path.join(reactAppBaseDir, "src", `${_.capitalize(obj.name)}Form.js`), component, { newline: true }); 
        }

    });
}

// 
function setForm(props){
    let acc = "";

    console.log("setting form")

    acc += "<form onSubmit={handleSubmit}>"

    _.forOwn(props, function (value, key) {

        console.log(key + " : " + value)
        switch (value) {
            case 'String':
                acc += 
                `
                    <label htmlFor="${key}">${key}</label>
                    <input type="text" id="${key}" name="${key}" onChange={e => handleChange(e.target.name, e.target.value)} />
                `
                break;
            case 'Date':
                acc += 
                `
                    <label htmlFor="${key}">${key}</label>
                    <input type="date" id="${key}" name="${key}" onChange={e => handleChange(e.target.name, e.target.value)} />
                `
                break;
            case 'Number':
                acc += 
                `
                    <label htmlFor="${key}">${key}</label>
                    <input type="number" id="${key}" name="${key}" onChange={e => handleChange(e.target.name, e.target.value)} />
                `
                break;
            default:
        }
    });

    acc += 
    `
        <input type="submit" value="Send" />
        </form>
    `;

    console.log(acc)
    return acc;
}