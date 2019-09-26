const http = require('http');
const fs = require('fs');

const server = http.createServer((req,res) => {
    const url = req.url;
    const method = req.method;
    //Ojo que el form generará un nuevo request cuando el user presione el boton
    //y este Listener se volverá a ejecutar pero como no he preguntado por otra ruta mas que "/",
    //entonces se ejecutará el segundo bloque de código
    if(url === '/'){
        res.write(`<html>
            <head>
                <title>Formulario</title>
            </head>
            <body>
                <h1>Formulario</h1>
                <form action="/message" method="POST">
                  <input type="text" name="message" /><br><br>
                  <button type="submit">Send</button>
                </form>
            </body>
        
        </html>`);
        res.end();
        return;
    }

    if(url === "/message" && method==="POST"){
        const body = [];//declaro un array donde se guardará todo el body del request
        //uso el evento 'data' , el cual se dispara cada vez que 
        //se tenga un chunk de data listo para leer. Esta iteración depende ya de Nodejs
        req.on('data',chunk => {
            body.push(chunk);
            console.log(chunk);
        });
        //Uso el evento end , el cual se dispara cuando ya se hayan acabado todos los chunk
        //si uso el return a este evento, haría que el codigo que esté despues de
        //este bloque, ya no se ejecute y no haya problemas con la redireccion
        /* return req.on()...   ver app3.js*/
        req.on('end', ()=>{
            //uso el objeto Buffer de Node js que es como un arreglo que
            //guardará los chunks recibidos. Esto lo parseo a string porque sé que he recibido strings
            const parsedBody = Buffer.concat(body).toString();
            console.log(parsedBody);
            //como la data ha llegado el param que viene del formulario en forma de key value
            //acá pinto en consola el valor del mensaje enviado para curiosear
            console.log(parsedBody.split('=')[1]);

            //escribo el buffer en un archivo y lo hago dentro de este evento para 
            //garantizar que se haga la escritura cuando ya se tienen todos los chunks
            //aqui usé un archivo sin extension por error, pero igual funca
            //Ojo que el metodo writeFileSync bloquea la continuacion del programa hasta 
            //que se haya terminado la escritura del archivo
            fs.writeFileSync('./message', parsedBody);
        });


        /**  OJO que este codigo se ejecutará primero que los callbacks.
         * (los callbacks solo se registran primero)
         * debido a que node y js son asincronos (Loop Event)
         */

        //fs.writeFileSync('./message.txt', "DUMMY");
        res.statusCode = 302;//asigno un codigo de respuesta que indica redirección
        res.setHeader("Location","/");//efectúo la dirección
        res.end();
        return;
    }

    //Esto se ejecutará cuando una peticion llegue con una url diferente a "/" y a "/message"!!
    res.write(`<html>
            <head>
                <title>Formulario</title>
            </head>
            <body>
                <h1>Welcome to my first Node Js app , yeahh!!!</h1>
            
            </body>
        
        </html>`);

});

server.listen(3000);