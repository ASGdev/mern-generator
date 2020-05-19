const _ = require('lodash');
const write = require('write');
var shell = require('shelljs');
const path = require('path');
const fs = require('fs');

exports.init = function (reactAppBaseDir, defs) {

    defs.objects.forEach((obj) => {

        let component = 
            `import React, { useState, useEffect } from 'react';
            import logo from './logo.svg';
            import './App.css';
            import { useParams } from "react-router-dom";
            import * as ApiClient from './apiClient'

            function ${_.capitalize(obj.name)}() {
                let { id } = useParams();
                const [ ${obj.name}, set${_.capitalize(obj.name)} ] = useState({});

                useEffect(() => {
                    ApiClient.get${_.capitalize(obj.name)}(id)
                        .then((data) => set${_.capitalize(obj.name)}(data))
                        .catch((e) => console.log(e))
                }, []);

                return (
                    <div>
                        <h3>ID: {id}</h3>

                        <pre>{JSON.stringify(${obj.name})}</pre>
                    </div>
                );
            }

            export default ${_.capitalize(obj.name)};
            `
        
        write.sync(path.join(reactAppBaseDir, "src", _.capitalize(obj.name) + ".js"), component, { newline: true }); 

    });
}