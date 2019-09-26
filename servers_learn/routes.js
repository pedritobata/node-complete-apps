const fs = require('fs');

const requestHandler = (req, res) => {
    const url = req.url;
    const method = req.method;
    if(url == '/'){
        res.write(`
            <html>
                <head>
                    <title>Formulario</title>
                </head>
                <body>
                    <h1>Formulario</h1>
                    <form action="/message" method="POST">
                    <label>Escribir mensaje
                            <input type="text" name="message">
                    </label>
                    <br><br>
                    <button>Enviar</button>
                    </form>
                </body>
            </html>
        `);
        return res.end();
    }

    if(url == '/message' && method == 'POST'){
        const body = [];
        req.on('data', chunk => {
            body.push(chunk);
        });

        return req.on('end', ()=> {
            const parsedBody = Buffer.concat(body).toString();
            fs.writeFile('./message.txt',parsedBody, err => {
                res.statusCode = 302;
                res.setHeader('Location', '/');
                res.end();
            });
        });

    }

    res.write(`<html>
                <head><title>Welcome</title></head>
                <body>
                    <h1>Welcome to my first Node.js App</h1>
                </body>
                </html>`
    )

    res.end();

};

//module.exports = requestHandler;

/* module.exports = {
    handler: requestHandler,
    someText: 'Some hardcoded text'
} */

/* module.exports.handler = requestHandler;
module.exports.someText = 'Some harcoded text yeah'; */

//En Node.js se puede usar un atajo para el export que suprime tener escribir module.
exports.handler = requestHandler;
exports.someText = 'Some harcoded text yeah';