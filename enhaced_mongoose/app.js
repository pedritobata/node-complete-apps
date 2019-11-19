const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const MONGODB_URI = 'mongodb+srv://pedro:R@tamacue1@cluster0-rw1t7.mongodb.net/shop?';

const csrf = require('csurf');
const csrfProtection = csrf();//tambien podriamos mandar un argumento a csrf para confifurar cosas
const flash = require('connect-flash');
const multer = require('multer');

const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'//nombre a criterio
});

//defino un multer storage para mi file tipo imagen
const fileStorage = multer.diskStorage({
  //a ambos campos les mandamos un callback y nos da la opcion de configurar el file y hacer logica
  //al pasarnos el request, el file y un callback cb
  //este cb es el que nos permitirá decidir en qué momento se lanza un error y cual es el nombre
  //exacto del file y su path.
  destination: (req, file, cb) => {
    //primer argumento: error(en el momento en que le pongo un mensaje, multer tomará como que
    //que queremos lanzar error es ese momento de la logica)
    //con null le dicmos que normal, que asigne el destination (que es el segundo argumento)
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    //le generamos un nombre unico al file anteponiendo la fecha y hora exacta de le creacion
    cb(null, new Date().toISOString() + '-' + file.originalname);
  },
});

//el filtro de tipos de imagenes lo manejamos en otro parametro
//en este caso es un callback igual a los que asignamos en el fileStorage
const fileFilter = (req,file,cb) => {
  if(file.mimetype === 'image/png' ||
     file.mimetype === 'image/jpg' ||
     file.mimetype === 'image/jpeg'){
      //si el tipo de imagen es el deseado , true indica que proceda nomas
      //null indica que no hay mensaje de error
      cb(null, true);
  }else {
      cb(null, false);
  }
}

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
//cuando hay archivos binarios que vienen en el request ,como imagenes,
//usamos otro parseador extra , multer
//le decimos a multer que hay UN campo que queremos parsear y cual es su nombre "image"
//ademas podemos configurar multer y decirle por ejemplo la carpeta de destino del file (dest)
//si no existe la ruta , multer la crea!! . 
//En este caso ya el buffer binario que generaba multer se convierte a un file
//app.use(multer({ dest: 'images' }).single('image'));

//tambien puedo usar una propiedad mas especifica (storage) que me
//permite gestionar la subida del archivo, como nombre exacto, path, logica para validar etc
//ver arriba
app.use(multer({ storage: fileStorage, fileFilter: fileFilter}).single('image'));

//static asume que llos recursos en esta carpeta estan en el root de la aplicacion
//osea que los recursos seran invocados directamente como:
// http://localhost:3000/css/main.css,  sin el public. el public solo dice donde estan nuestros
//recursos pero no tiene que ver nada con la url
app.use(express.static(path.join(__dirname, 'public')));
//si queremos asignar qué request especificos iran a esta carpeta lo ponemos como primer argumento
//asi le decimos a express que el root para nuestros recursos guardados en la carpeta images es "/images" y NO "/"
app.use('/images',express.static(path.join(__dirname, 'images')));



app.use(session({
  secret: 'my secret',
  resave: false,//para que no se guarde la session con cada request
  saveUninitialized: false//para que no se genere la cookie de IDsession en sesiones no iniciadas
  //tambien se puede configurar las cookies
  ,cookie : {
    //aca podemos configurar el maxAge, expires, etc
    //El servidor crea una cookie que será enviada al cliente para que este nos la
    //envie en los subssiguientes requests
  },
  store: store
}));

//este MW creará tokens para cada post que el usuario dispare.
//estos tokens deben ser agregados a las vistas para que las identifiquen de posibles ataques
//de Cross Site Request Fogerty.  mi aplicacion solo responderá a las vistas que tengas su token y no
//a posibles fake pages que quieran imitar a las mias
//Luego mas abajo usamos otro MW para que genere este token y se lo agregue al request que invoca a cada
//vista. La vista cogerá ese token y lo agregará en un input hidden con el nombre exacto "_csrf"
//Hay que agregar a mano ese campo hidden en todas las vistas  que tengan un form post !!!
app.use(csrfProtection);

//este MW es para enviar mensajes flash entre redirecciones
app.use(flash());

app.use((req, res, next) => {
  //Cuando lanzamos un error normal fuera de un Promise entonces
  //el MW especial de express lo reconocerá, asi el error no haya sido enviado dentro de next(error)
  //RECONTRA GUARDIA : si el MW especial solo tiene un res.redirect(/500), entonces
  //se producirá el fatídico LOOP INFINITO!!!. Esto debido a que el redirect ocasiona que
  //el request vuelva a generarse y vuelva a caer en el MW en el que estamos ahora
  //este, a su vez, debido al throw Error lo volverá a mandar al MW especial y ......
  //throw new Error('Dummy error');


  if(!req.session.user){
    return next();//pongo return para que ya no se ejecute el resto de este metodo,el next por
    //si solo no hace que salgamos del metodo
  }
  User.findById(req.session.user._id)//obtenemos es user de la collection users NO
  //desde la collection sessions, la cual solo tiene info basica del user y NO los metodos magicos!!
    .then(user => {
      if(!user){
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
       //si lanzamos un error normal dentro de una Promesa como ahora
       //el MW especial que definimos para catchear errores no lo reconocerá
       //este MW solo reconoce los errores que se hayan agregado al next(error)!!
       throw new Error(err);
    });
});

//MW para agregar parametros a todas las peticiones
//agregamos el token creado por csrf a cada vista 
//para que luego estas lo envian en las peticiones post y nuestra app las reconozca
app.use((req,res,next)=>{
  //locals es una propiedad especial de express que representa la petidcion que
  //se está enviando hacia el siguiente componente o vista
  //se comporta igual que el segundo argumento del res.render()
  //envio el parametro de autenticacion a la vista
  res.locals.isAuthenticated = req.session.isLoggedIn;

  //envio el token de csrf a la vista gracias al metodo csrfToken() proporcionado por csurf
  res.locals.csrfToken = req.csrfToken();
  
  next();
});




app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use('/500', errorController.get500);
app.use(errorController.get404);

//Este es un MW especial que nos proporciona express
//tiene un argumento extra al comienzo, el error.
//cuando express detecte que se ha generado un next con un Error como argumento (ver controller admin.js)
//se saltará todos los MW "normales" y solo entrará a los MW especiales. SOLO para este caso
//por eso no hay problema con nuestro MW de 404 porque no chocan
app.use((error, req, res, next) => {
  console.log(error);
  res.redirect('/500');
}); 

mongoose
.connect('mongodb+srv://cluster0-rw1t7.mongodb.net/shop?retryWrites=true&w=majority',{
  user: 'pedro',
  pass: 'R@tamacue1'
})
  .then(result => {
    /* User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: 'perico',
          email: 'perico@hotmail.com',
          cart: {
            items: []
          }
        });
        user.save();
      }
    }); */
    console.log('Connected via Mongoose!!!');
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
