const express = require('express');

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const graphqlHttp = require('express-graphql');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');

const auth = require('./middleware/is-auth');

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
//        CORS  !!!!
//Cross Origin Resource Sharing
app.use((req,res,next) => {
    //el * es el wildcard para que acepte todos los dominios que lo consuman
    //puedo especificar dominios exactos tambien
    //OJO que setHeaders solo suscribe los headers al response, NO envia el response!!!
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    //Aqui hacemos un ajuste para cuando las peticiones vienen usando GraphQL
    //como GraphQL SOLO ACEPTA peticiones POST, entonces, cuando el frontend manda una peticion
    //primero siempre manda una peticion OPTIONS y luego manda la peticion principal
    //pero como OPTIONS  no es soportado por GQl , entonces le hacemos un byPass
    if(req.method === 'OPTIONS'){
      //este metodo es otro de express para solo enviar un status!!
      //ponemos return porque queremos responder directamente al cliente para que mande
      //la peticion principal
      return res.sendStatus(200);
    }

    next();
});

//este MW es para validar la autorization para las petciones GQl
app.use(auth);

//MW para subir imagenes, el cliente nos envía el path de la imagen antigua cuando es un update
app.put('/post-image',(req,res,next) => {
  if(!req.isAuth){
    throw new Error("Not authenticated.");
  }
  if(!req.file){//si multer no aceptó el file, no lo agrega al request
    //si el cliente no envió imagen nueva, el filePath que sí se envía mas abajo cuando sí hay imagen nueva
    // se enviará como undefined (en forma de string "undefined")
    return res.status(200).json({message:"No file provided."});
  }
  if(req.body.oldPath){//si es un update con imagen nueva borramos la anterior
    clearImage(req.body.oldPath);
  }
  //enviamos el mensaje y el path proporcionado po multer
  
  return res.status(201).json({message: "File uploaded.", filePath: req.file.path})
});

//MW para Graphql
//GQl usa POST para funcionar por default, pero acá no hemos sido especificos
//sino que estamos usando "use". Esto es para soportar tambien GET. 
//con esto podemos, por ejemplo usar la herramienta graphiql que es muy util
//para probar nuestra API y esta herramienta usa GET
app.use('/graphql',graphqlHttp({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: true,
  //esta funcion nos permitirá capturar el erro original que viene de mi app
  //y formatear mi propio error tal como quiero que se muestre al cliente
  //el argumento es el error propio de GQl
  //esta funcion debe retornar el error formateado que quiero enviar
  //la funcion que antes se usaba era formatError() pero ya está deprecada!!
  customFormatErrorFn(err){
    if(!err.originalError){
      // err.mensajon = 'jeje';
      return err;
    }
    const data = err.originalError.data;
    const message = err.message || 'An error ocurred.';//este mensaje lo obtengo del error propio de GQl
    const code = err.originalError.code || 500;
    return {
      data: data,
      message: message,
      code: code
    }

  }
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


  const clearImage = filePath => {
    filePath = path.join(__dirname, ".", filePath);
    console.log("Borrar:", filePath);
    fs.unlink(filePath, err => console.log(err));
  };