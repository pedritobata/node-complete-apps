var express = require('express')
var bodyParser = require('body-parser')
const path = require('path');
const expressHbs = require('express-handlebars');



const app = express();

var adminData = require('./routes/admin');
var shopRoutes = require('./routes/shop');

//usamos el template engine pug. lo instalamos como : npm install --save ejs pug express-handlebars
//ejs y handlebars son otros engines
//usamos el metodo set() de express , el cual permite declarar CUALQUIER variable global que quiera
// pero hay variables o palabras reservadas que funcionan como variables globales para express y
//que configuran cosas especificas como el template engine que se va  a usar y la ruta donde se encuentran
//las vistas pug

//app.set('view engine','pug');


//si quiero usar otro template engine que no es reconocido por default por express
//tengo que crear un engine. le pongo el nombre que quiera y ese nombre deberá ser usado en
//las  vistas COMO EXTENSION DE los archivos
//OJO para las versiones diferentes de 3.0 de express-handlebars se obliga a:
//llamar el directorio comun : layouts (con s)
//llamar al engine handlebars (extension del archivo)
/*
app.engine('hbs',expressHbs({
    layoutsDir: 'express_learn2/views/layouts/',
    defaultLayout: 'main',
    extname: 'hbs'
}));
app.set('view engine', 'hbs');
*/

// ejs es reconocido por express por default , igual que pug
app.set('view engine','ejs');



app.set('views', path.join(__dirname, 'views'));//el 2do parametro es la ruta(express busca desde el root /views)
// en este caso no era necesario configurar la ruta porque views es la ruta por defecto

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
    //res.status(404).sendFile(path.join(__dirname,"views",'404.html'));
    res.status(404).render('404', {pageTitle:'Page Not Found'});
})


app.listen(3000);

