var express = require('express')

const router = express.Router();

//El router es como un mini express que intercepta los request y los
// transforma en los callbacks que app.use() requiere segun la url que llegue
// los routes se escriben igualito que los app.use() solo que se usar router en vez de app!!

router.get('/add-product', (req,res,next)=>{
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
});

router.post('/product', (req,res,next)=>{
    console.log(req.body);
    res.redirect('/');
});

module.exports = router;