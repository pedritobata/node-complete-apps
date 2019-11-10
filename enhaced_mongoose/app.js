const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const MONGODB_URI = 'mongodb+srv://pedro:R@tamacue1@cluster0-rw1t7.mongodb.net/shop?';

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

/* app.use((req, res, next) => {
  User.findById('5dc43f609912b105223839db')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
}); */

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
    User.findOne().then(user => {
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
    });
    console.log('Connected via Mongoose!!!');
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
