const express = require('express');
const feedRouter = require('./routes/feed');
const bodyParser = require('body-parser');

const app = express();

//ya NO parseamos con urlencoded ya que ese es para el formato x-www-form-urlencoded
//ahora nuestro formato que recibiremos de los clientes es application/json!!
app.use(bodyParser.json());


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


app.listen(8080);