//const http = require('http');

const express = require('express');
const app = express();


// Creamos Middlewares. Estos son como interceptors que se ejecutan en cada peticion
//la funcion use() tiene varias sobrecargas, puede recibir unu array de objetos RequestHandler
//pero la mas usada es un callback con tres parametros
//los middlewares son ejecutados por Node en orden de aparicion

//use puede recibir un primer parametro que sea un string indicando el path del request
//que queremos capturar (la url que se ha invocado desde el cliente)
//el path por defecto es '/' si no pongo nada (tambien lo puedo poner) y 
//este se comporta como un comodin o startsWith()
//igual a los Routes en React!!
app.use('/',(req,res,next)=>{
    console.log('This always runs!!');
    // si no invoco a next(), no se invocará el siguiente middleware!!
    next();
});

app.use('/add-product', (req,res,next)=>{
    console.log("In the Middleware 1");
    res.send('<h1>The "Add Product" Page!!</h1>');
    //notese que ya no llamo a next para ya no se ejecuten los siguientes middleware así
    //sus url hicieran match!!
    //Esta es la manera de rutear mis requests!!!!
});



app.use((req,res,next)=>{
    console.log('In the Middleware 2');
    // con el response que nos pasan los middlewares podemos
    // usar el metodo send()  que sería como el write() pero ya arma las cabeceras para
    //enviar html automaticamente
    res.send('<h1>Hello World from Express!!</h1>');
});




//app será un objeto que es una funcion handler para las peticiones http
// recordar el callback que le pasábamos a createServer((req,res) => bla bla)
/*
const server = http.createServer(app);

server.listen(3000);
*/

// En Express será suficiente usar app para crear el servidor y hacerlo que comience a escuchar
app.listen(3000);