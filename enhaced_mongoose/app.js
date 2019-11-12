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

const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'//nombre a criterio
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
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

app.use((req, res, next) => {
  if(!req.session.user){
    return next();//pongo return para que ya no se ejecute el resto de este metodo,el next por
    //si solo no hace que salgamos del metodo
  }
  User.findById(req.session.user._id)//obtenemos es user de la collection users NO
  //desde la collection sessions, la cual solo tiene info basica del user y NO los metodos magicos!!
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
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

app.use(errorController.get404);

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
