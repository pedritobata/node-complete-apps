const http = require('http');
const fs = require('fs');


const server = http.createServer((req,res) => {
    const url = req.url;
    const method = req.method;

    if(url == '/'){
        res.write(`<html>
                    <head><title>Formulario</title></head>
                    <body>
                        <h1>Formulario</h1>
                        <form action="/message" method="POST">
                          <p>Escribir mensaje</p>
                          <input type="text" name="message" /><br><br>
                          <button>Enviar</button>
                        </form>
                    </body>
                   </html>`);
        return res.end();           
    }

    if(url === '/message' && method==="POST"){
        const body = [];
        
        req.on('data', chunk => {
            body.push(chunk);
            console.log(chunk);
        });

       return req.on('end', ()=>{
            const parsedBody = Buffer.concat(body).toString();
            //escribo en un archivo usando el metodo sincrono para que
            //el programna continúe su ejecucion mientras de escribe el archivo
            //fiel a su estilo js, este metodo recibe un callback pasandonos el error si lo hubiera
            fs.writeFile('./message.txt',parsedBody, err => {
                res.statusCode = 302;
                res.setHeader('Location','/');
                res.end()
            })
        });

    }
    
    //Este código es el que se ejecutará por default cuando ninguna de las anteriores rutas se haya 
    //recibido en la petición
    res.write(`<html>
    <head><title>Welcome</title></head>
    <body>
        <h1>Welcome to my first Node.js App</h1>
    </body>
   </html>`);
    res.end();

});

server.listen(3000);