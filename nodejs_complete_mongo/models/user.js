const mongodb = require('mongodb');
const getDB = require('../util/database').getDB;

class User {
    constructor(username, email, cart, id){
        this.username = username;
        this.email = email;
        this.cart = cart;//agregamos toda la carta al user, ya que se relacionan fuertemente
        //no hay posibilidad a redundar
        this._id = id;
    }

    save(){
        const db = getDB();
        return db.collection('users').insertOne(this);
    }

    addToCart(product){
        const cartProductIndex = this.cart.items.findIndex(cp => {
            return cp.productId.toString() === product._id.toString();
        });
        let newQuantity = 1;
        const updatedCartItems = [...this.cart.items];
        if(cartProductIndex >= 0){
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        }else{
            updatedCartItems.push({
                productId: new mongodb.ObjectId(product._id), 
                quantity: newQuantity
            });
        }

        const db = getDB();
        const updatedcart = {items: updatedCartItems};
        return db.collection('users').updateOne({_id: new mongodb.ObjectId(this._id)},
          {$set: {cart: updatedcart}});
    }

    getCart(){
        const db = getDB();
        const productIds = this.cart.items.map(item=>{
            return item.productId;
        });
        return db.collection('products').find({_id: {$in: productIds}}).toArray()
        .then(products=>{
            return products.map(p => {
                return {
                    ...p,
                    quantity: this.cart.items.find(i => {
                        return i.productId.toString() === p._id.toString();
                    }).quantity
                }
            });
        });
    }

    deleteItemFromCart(prodId){
        const updatedCartItems = this.cart.items.filter(item => {
            return item.productId.toString() !== prodId.toString();
        });
        const db = getDB();
        const updatedcart = {items: updatedCartItems};
        return db.collection('users').updateOne({ _id: new mongodb.ObjectId(this._id)},
        { $set: { cart: updatedcart } });
    }

    //este metodo se usará para agregar orders al usuario
    //pero para ello se creará una nueva collection, ya que esta puede ser bien extensa y
    //no conviene anidarlo dentro del user
    addOrder(){
        const db = getDB();
        return this.getCart()
        .then(products => {
            //en la orden quiero guardar toda la data del producto y
            //parte de la data del user
            const order = {
                items: products,
                user: {
                    _id: new mongodb.ObjectId(this._id),
                    name: this.username
                }
            };
            //agrego la carta como si fuera una order ya que tienen exactamente los mismo campos!!
            return db.collection('orders').insertOne(order);
        }).then(result=>{
            //limpio la cart en memoria
            this.cart = [];
            //limpio la cart de la BD
            return db.collection('users').updateOne(
                {_id: new mongodb.ObjectId(this._id)},
                { $set: { cart: {items: []} } });
        });
        
    }


    getOrders(){
        const db = getDB();
        return db.collection('orders')
        //en mongo puedo hacer consultas de objetos anidados pero
        //tengo que especificar sus relaciones usando comillas ''
        .find({'user._id' : new mongodb.ObjectId(this._id)}).toArray();
    }


    static findById(userId){
        const db = getDB();
        //tambien se puede usar find() y luego next() . recordar que find() devuelve un cursor
        return db.collection('users').findOne({_id: new mongodb.ObjectId(userId)});
    }

}

module.exports = User;