const fs = require('fs');
const path = require('path');

const p = path.join(path.dirname(process.mainModule.filename),"data","cart.json");

module.exports = class Cart {
    static addProduct(id, price){
        fs.readFile(p, (err, fileContent) => {
            let cart = {products: [], totalPrice:0};
            //console.log('filecontent',fileContent);
            if(!err && fileContent.toString()){
                cart = JSON.parse(fileContent);
            }
            const existingProductIndex = cart.products.findIndex(p=>p.id===id);
            const existingProduct = cart.products[existingProductIndex];
            let updatedProduct;
            if(existingProduct){
                updatedProduct = {...existingProduct};
                updatedProduct.qty = updatedProduct.qty + 1;
                //cart.products = [...cart.products];
                cart.products[existingProductIndex] = updatedProduct;
            }else{
                updatedProduct = {id: id, qty: 1};
                cart.products.push(updatedProduct);
            }
            //con el simbolo '+' extra se castea la variable a un numero
            cart.totalPrice = cart.totalPrice + +price;
            fs.writeFile(p, JSON.stringify(cart), err => {
                console.log(err);
            })

        });

    }


    static deleteProduct(id, price){
        fs.readFile(p,(err, fileContent) => {
            if(err){
                return;
            }
            const updatedCart = JSON.parse(fileContent);
            const product = updatedCart.products.find(p=>p.id===id);
            if(!product){
                return;
            }
            updatedCart.products = updatedCart.products.filter(p=>p.id!==id);
            updatedCart.totalPrice = updatedCart.totalPrice - product.qty * price;

            fs.writeFile(p, JSON.stringify(updatedCart), err=>{
                console.log(err);
            })
        });
    }

    static getCart(cb){
        fs.readFile(p,(err, fileContent)=>{
            let cart = null;
            if(!err && fileContent){
                cart = JSON.parse(fileContent.toString());
            }
            cb(cart);
        });
    }


}