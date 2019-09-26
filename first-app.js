console.log('Hello from Node JS'); 
//creamos un archivo de texto:
const fs = require('fs');
fs.writeFileSync('hello.txt','Hello from a file with Node JS!!');

// Para crear un proyecto con npm usar:
// npm init ,  y luego llenar las preguntas que te van haciendo
// npm creará el archivo package.json en el cual , entre otras cosas puedo/
//agregar mis proppios scripts para poder ejecutarlos por consola.
//aquí un extracto
/* "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node first-app.js",    start es una propiedad reservada y se ejecuta como : npm start
    "start-server":"node first-app.js"  start-server me la inventé yo y se ejecuta como: npm run start-server
} */

//Para instalar nodemon como dependencia de desarrollo:
//Para producción simplemente omitir -dev
// npm install nodemon --save-dev
//si quisiera instalar nodemon como una variable global del sistema sería : npm install -g nodemon 
//para usar nodemon simplemente cambio el script que creé para el comando reservado start:
// "start" : "nodemon first-app.js"
//y luego bastará con ejecutar npm start una vez para que nodemon se quede en ejecucion y esperando
// por cada cambio qua hagamos para refrescar el servidor!!


//Para debugg , se puede customizar la configuracion del debugger en el archivo launch.json
//tambien se puede MODIFICAR los valores de variables de mi codigo en el panel izquierdo donde aparecen
// las variables que se estan creando en la ejecucion del programa, dando doble click sobre ellas
//esto afectará la ejecucion con los nuevos valores que le demos a las variables solo para el debug!!
//recordar la naturaleza asincrona de Nodejs a la hora de poner los breakpoints para debuggear!!