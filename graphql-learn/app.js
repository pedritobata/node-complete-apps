const express = require('express');

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');

const graphqlHttp = require('express-graphql');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'image/png' ||
  file.mimetype === 'image/jpg' ||
  file.mimetype === 'image/jpeg'){
    cb(null, true);
  }else{
    cb(null, false);
  }
}

const app = express();

//ya NO parseamos con urlencoded ya que ese es para el formato x-www-form-urlencoded
//ahora nuestro formato que recibiremos de los clientes es application/json!!
app.use(bodyParser.json());
//en el metodo single le digo a multer en qué campo le vandrá el binario del file del cliente
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));

app.use('/images',express.static(path.join(__dirname, 'images')));





//para que nuestra API pueda ser consumida desde otros dominios que no sean el mismo en el que
//está desplegada, tenemos que configurar las cabeceras que usará nuestro response para soportar 
//CORS
//Cross Origin Resource Sharing
app.use((req,res,next) => {
    //el * es el wildcard para que acepte todos los dominios que lo consuman
    //puedo especificar dominios exactos tambien
    //OJO que setHeaders solo suscribe los headers al response, NO envia el response!!!
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    next();
});


//MW para Graphql
app.use('/graphql',graphqlHttp({
  schema: graphqlSchema,
  rootValue: graphqlResolver
}));


app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;//message de error es un atributo propio del MW
    const data = error.data;
    res.status(status).json({
      message: message,
      data: data
    });
});

mongoose
.connect('mongodb+srv://cluster0-rw1t7.mongodb.net/messages?retryWrites=true&w=majority',{
  user: 'pedro',
  pass: 'R@tamacue1'
})
  .then(result => {
    app.listen(8080);
    
  })
  .catch(err => {
    console.log(err);
  });


