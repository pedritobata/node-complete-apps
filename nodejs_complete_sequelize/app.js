const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./util/database');

const errorController = require('./controllers/error');

const app = express();

//uso de mysql:
/*
db.execute('select * from product')
.then(result => {
    //result trae un arreglo con dos arreglos mas adentro
    //el primer arreglo trae los objetos recuperados
    console.log(result[0]);
})
.catch(err => {
    console.log(err);
});
*/

//con los metodos diferentes a use(), el next() se dispara automaticamente
// solo con el metodo use() hay que disparar los metodos next() a mano!!

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// sincronizamos con la BD. Sequelize crea las tablas si no existieran aun
// ademas te agrega un par de campos a tus tablas : createAt y updatedAt
//sync devuelve una promesa
sequelize.sync()
.then(result=>{
    //console.log(result);
    app.listen(3000);//recien inicio mi server cuando tenga conexion con la BD!
})
.catch(err=>{
    console.log(err);
});


