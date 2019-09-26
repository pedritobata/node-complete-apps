//Node tiene varios modulos disponibles para varias cosas
//entre ellos: http, https , fs, path (para crear paths y trabajar con fs) , os (para el sistema Operativo)

//importamos el modulo http con la funcion require de Node
const http = require('http');

//al createServer le paso un callback o Listener que Node ejecutará CADA VEZ QUE ENTRE UNA PETICION AL SERVER
const server = http.createServer((req,res) => {
    //El objeto Request tiene muuuchas propiedades y metodos
    //listemos unos poquitos básicos
    console.log(req.url, req.method, req.headers);

    //Usando el response
    res.setHeader('Content-Type','text/html');
    res.write('<html>');
    res.write('<head><title>My first App</title></head>');
    res.write('<body><h1>Hello, this is my first Node.js Server!!</h1></body>');
    res.write('</html>');
    res.end(); //tenemos que cerrar el response. despues de cerrarlo ya no se puede escribir (da error!s)

});

//Tengo que iniciar el server para que comience a escuchar
//puedo pasarle varios argumentos (port, hostname, backlog, listener)
//recien cuando haga una peticion se disparará el Listener que definí en la creacion del server 
//a partir de esta llamada a listen() , el server queda ejecutándose y escuchando (Event loop)
//El Event loop se queda escuchando siempre y cuando aun existan lsiteners registrados
//El Event loop es el encargado de correr nuestro codigo y realiza acciones respondiendo a eventos
server.listen(3000);

//Puedo matar el servidor con esto. Pero no sería normal, para qué quiero apagar mi servidor??
//process.exit();