const express = require('express');
const feedRouter = require('./routes/feed');
const authRouter = require('./routes/auth');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');

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

/*********** CODIGO USADO PARA CONSUMIR LA API DESDE CODEPEN *********/
/*
const btnGet = document.getElementById('btnGet');
const btnPost = document.getElementById('btnPost');

btnGet.addEventListener('click', e => {
  fetch('http://localhost:8080/feed/posts')
  .then(result => result.json())
  .then(data => console.log(data))
  .catch(err => console.log(err));
})

btnPost.addEventListener('click', e => {
  fetch('http://localhost:8080/feed/post',{
    method: "POST",
    body: JSON.stringify({
      title: 'Third post',
      content: 'This is the 3rd post!!'
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(result => result.json())
  .then(data => console.log(data))
  .catch(err => console.log(err));
})

*/


app.use('/feed', feedRouter);
app.use('/auth', authRouter);

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
    console.log('Connected via Mongoose!!!');
    const server = app.listen(8080);
    //Vamos a usar sockets a traves del paquete Socket.io!!
    //El protocolo Socket se usa para hacer push principalmente, es decir ,no solo se
    //hace pull como en http (hacer peticiones para obtener algo), tambien se puede hacer
    //push , osea , que el server solito manda una info al cliente si que este se la haya pedido!!
    //obtenemos una instancia de socket POR CADA CLIENTE que se conecte con nuestro server via 
    //el protocolo socket. Este protocola trabaja por dentro con http normal y NO interfiere con
    //nuestro trafico http normal porque es un protocolo diferente
    const io = require('./socket').init(server);
    //suscribimos una funcion que se ejecutara cuando un cliente se conecte a nuestro server
    io.on('connect', socket => {
      //socket representa al cliente que hace la peticion socket
      console.log('Socket Client connected!!');
    })
  })
  .catch(err => {
    console.log(err);
  });


