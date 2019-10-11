var express = require('express')
var bodyParser = require('body-parser')
const path = require('path');

const app = express();

var adminData = require('./routes/admin');
var shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({extended:false}));

//cada vez que se haga una peticion por un recurso estatico, es decir un archivo especifico
//como .html, .js,  .txt, imagen, etc.  Express de por sí NO permite accederlo
// tenemos que usar el metodo static para decirle a express donde se encuentran nuestros
//recursos estaticos publicos!! usamos el metodo static()
//asi en la vista invocamos el href= /css/main.css  porque ya le dijimos que la carpeta public es la
//que tiene los recursos estaticos y a partir de ahi indicamos el resto del path!!
app.use(express.static(path.join(__dirname,'public')));

app.use('/admin',adminData.router);
app.use(shopRoutes);

// Agregamos un MW con la ruta default para que muestre pagina de 404
app.use((req,res,next)=>{
    //express proporciona metodos chained para hacer diferentes cosas
    //al final se invoca a send()
    res.status(404).sendFile(path.join(__dirname,"views",'404.html'));
})


app.listen(3000);

