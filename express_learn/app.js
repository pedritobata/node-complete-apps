const http = require('http');

const express = require('express');
const app = express();


// Creamos Middlewares. Estos son como interceptors que se ejecutan en cada peticion
//la funcion use() tiene varias sobrecargas, puede recibir unu array de objetos RequestHandler
//pero la mas usada es un callback con tres parametros
//los middlewares son ejecutados por Node en orden de aparicion
app.use((req,res,next)=>{
    console.log('In the Middleware 1');
    // si no invoco a next(), no se invocará el siguiente middleware!!
    next();
});

app.use((req,res,next)=>{
    console.log('In the Middleware 2');
    //...
});




//app será un objeto que es una funcion handler para las peticiones http
// recordar el callback que le pasábamos a createServer((req,res) => bla bla)
const server = http.createServer(app);

server.listen(3000);