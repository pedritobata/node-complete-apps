var express = require('express')
var bodyParser = require('body-parser')


const app = express();

// este MW (Middleware) va a usar el metodo urlencoded() de bodyParser
// este metodo retorna un callback tal como requieren los MW y por dentro
// llama next y parsea el cuerpo del request entrante!!
// ademas requiere que se le pase la configuracion para extended
// false quiere decir que solo parsee texto 
// Hay parsers para todo tipo de cuerpos de request
app.use(bodyParser.urlencoded({extended:false}));


app.use('/add-product', (req,res,next)=>{
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Document</title>
    </head>
    <body>
        <h1>Add Product</h1>
        <form action="/product" method="post">
            <input type="text" name="title"><br>
            <button type="submit">Save</button>
        </form>
    </body>
    </html>
    `);

    //nunca llamo a next() para que no se ejecuten los otros middlewares
});

// en vez de app.use() podemos usar use.post(), use.get(), use.put(), etc 
// para filtrar el tipo de request que queremos capturar!!
app.post('/product', (req,res,next)=>{
    // el request de express tiene un atributo body el cual recibe el valor de lo que llegue
    // en el cuerpo del request
    // Pero se tiene que parsear ese cuerpo (recordar que antes lo haciamos a mano con los chunks!)
    // para parsear uso el body-parser que es una libreria
    //eso lo defino como un middleware que lo pongo primerito porque siempre debo
    // parsear antes de ir a las rutas porsiaca manque
    console.log(req.body);
    res.redirect('/');//otro helper para redireccionar!! ya no usamos statusCode y setHeader
});

// al usar app.get('/') , la ruta '/' YA NO se comportará como startsWith() SINO COMO exact!!!!!
app.get('/', (req,res,next)=>{
    res.send('<h1>Hello from Express!!</h1>');
});

app.listen(3000);

