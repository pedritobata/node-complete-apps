var express = require('express')
var bodyParser = require('body-parser')

const app = express();

var adminRoutes = require('./routes/admin');
var shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({extended:false}));

// OJO que el orden en que pongo mis MWs sigue siendo importante!!
// como primer parametro le puedo pasar opcionalmente un string que
// filtre las urls que llegan de acuerdo al prefijo que le indique
// los paths de todos los admin no será necesario ponerles el prefijo
//ya que express se encarga de completarlo!!
app.use('/admin',adminRoutes);
app.use(shopRoutes);

// Agregamos un MW con la ruta default para que muestre pagina de 404
app.use((req,res,next)=>{
    //express proporciona metodos chained para hacer diferentes cosas
    //al final se invoca a send()
    res.status(404).send("<h1>Page not found</h1>");
})


app.listen(3000);

