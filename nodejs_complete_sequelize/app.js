const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./util/database');

const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

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

//creo este MW para cargar el usuario dummy que creé al iniciar mi servidor
//este usuario lo anexo al request
//recordar que los MW solo se suscriben al event loop la primera vez que levanto mi server
//por lo tanto este MW solo se ejecutará cuando entren los requests!!, lo cual garantiza
//que el user esté disponible para cuando empiezen los requests
app.use((req,res,next)=>{
    User.findByPk(1)//recordar que todos los metodos de sequelize devuelven los valores dentro de una Promesa!!
    .then(user=>{
        req.user = user;
        //ademas recordar que este user devuelto puede invocar a save(), destroy(), etc

        next();//no olvidar el next, estamos dentro de un app.use()!!!!
    })
    .catch(err=>console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);


//hacemos las relaciones entre tablas antes de sincronizar 
Product.belongsTo(User, {constraint:true, onDelete: 'CASCADE'});
//esto equivaldria a lo de arriba : uno a muchos. no sería necesario ponerlo
User.hasMany(Product);

//relaciones para Cart
User.hasOne(Cart);
Cart.belongsTo(User);

Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});

Order.belongsTo(User);
User.hasMany(Order);

Order.belongsToMany(Product, {through : OrderItem});


// sincronizamos con la BD. Sequelize crea las tablas si no existieran aun
// ademas te agrega un par de campos a tus tablas : createAt y updatedAt
//sync devuelve una promesa
//sequelize.sync({force:true})//con force true en dev obligamos a limpiar siempre las tablas
sequelize.sync()
.then(result=>{
    //console.log(result);
    //quiero crear un usuario dummy al vuelo!
    //primero verifico si ya existe
    return User.findByPk(1);//lo retorno como promesa
})
.then(user=>{
    if(!user){
        return User.create({name:'Perico', email:'periquito@pinpin'});
    }
    return user; //CUALQUIER VALOR QUE RETORNE DESDE UN 'then' AUTOMATICAMENTE SERÅ ENVUELTO EN UNA PROMESA!!!
})
.then(user=>{
    console.log(user);
    //uso un metodo magico de sequelize. una vez que he hecho las asociaciones
    //de las tablas, estos metodos magicos me permiten hacer operaciones multitabla
    //usando los metodos magicos que reemplazarian a los joins
    //por ejemplo, creo un cart para user, ya que esas tablas estan relacionadas con belongTo
    //Cart es sibgular por que la asociacion es belongTo y NO belongToMany!!
    return user.createCart();
    
})
.then(cart=>{
    app.listen(3000);//ejecuto mi servidor despues de haber creado mis tablas y mi usuario dummy
})
.catch(err=>{
    console.log(err);
});


