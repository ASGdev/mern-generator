const _ = require('lodash');
const write = require('write');
var shell = require('shelljs');
const path = require('path');
const fs = require('fs');

exports.init = function (reactAppBaseDir, defs) {

        let component = 
            `import React, { useState, useEffect } from 'react';
            import logo from './logo.svg';
            import './App.css';
            import { useParams } from "react-router-dom";
            import * as ApiClient from './apiClient'

            function LoginForm() {
                const [ user, setUser ] = useState({});

                useEffect(() => {
                }, []);

                return (
                    <div>
                        <h3>Login</h3>

                        <pre>{JSON.stringify(${obj.name})}</pre>
                    </div>
                );
            }

            export default LoginForm;
            `
        
        write.sync(path.join(reactAppBaseDir, "src", "LoginForm.js"), component, { newline: true }); 
}