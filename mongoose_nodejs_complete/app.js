const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

const User = require('./models/user');

const mongoose = require('mongoose');

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
    User.findById('5dc43f609912b105223839db')
    .then(user=>{
        req.user = user;//este user ya esta recargado por mongoose con metodos magicos!!
        next();
    })
    .catch(err=>console.log(err));
    
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

//ojo que la cadena de conexion que funcionaba antes para mongo normal no funca con mongoose
//debido a que mi password tiene @
//la solucion es mandar un segundo argumento como objeto especificando el user y pass
mongoose
.connect('mongodb+srv://cluster0-rw1t7.mongodb.net/shop?retryWrites=true&w=majority',{
    user: 'pedro',
    pass: 'R@tamacue1'
})
.then(result=>{
    //creamos el user dummy para la funcionalidad del cart posterior
    //validamos que no haya un user ya creado. findOne sin argumento nos devuelve el primer user encontrado
    User.findOne()
    .then(user => {
        if(!user){
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

    console.log('Connected through Mongoose!!');
    app.listen(3000);
})
.catch(err=>console.log(err));


