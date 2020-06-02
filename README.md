# mern-generator

Node application to generate a MERN stackf from an user-defined application properties.

## What it does
Frontend :

 - generates shared library to call backen API
 - uses `create-react-app` to generate React application
 - installs DOM routing  and generates basic views
 - generates API client

Backend :

 - installs Express and generate API endpoint
 - installs ORM (SQL or NoSQL) and creates schema 

## Usage
The application is defined in a JSON file
The entry point is the script `generate.js`

The application defined in the file with path `definition_file_path` is generated in the directory `dir` with this command :

    node generate -d <definition_file_path> -p <dir>
