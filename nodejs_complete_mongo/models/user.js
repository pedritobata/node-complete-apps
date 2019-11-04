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

    static findById(userId){
        const db = getDB();
        //tambien se puede usar find() y luego next() . recordar que find() devuelve un cursor
        return db.collection('users').findOne({_id: new mongodb.ObjectId(userId)});
    }

}

module.exports = User;