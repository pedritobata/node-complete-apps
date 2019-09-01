console.log('Hello from Node JS'); 
//creamos un archivo de texto:
const fs = require('fs');
fs.writeFileSync('hello.txt','Hello from a file with Node JS!!');