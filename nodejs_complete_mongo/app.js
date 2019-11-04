const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const app = express();


app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//creo este MW para cargar el usuario dummy que creé al iniciar mi servidor
//este usuario lo anexo al request
//recordar que los MW solo se suscriben al event loop la primera vez que levanto mi server
//por lo tanto este MW solo se ejecutará cuando entren los requests!!, lo cual garantiza
//que el user esté disponible para cuando empiezen los requests
app.use((req,res,next)=>{
    User.findById('5dc04e9e1c9d440000d37cb6')
    .then(user=>{
        req.user = new User(user.username, user.email, user.cart, user._id);
        next();
    })
    .catch(err=>console.log(err));
    
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoConnect(()=>{
    app.listen(3000);
});


