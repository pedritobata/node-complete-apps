
const Cart = require('./cart');

const db = require('../util/database');


module.exports = class Product {
  constructor(id,title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    //el segundo parametro indica los valores que iran en los placeholders
    return db.execute('INSERT INTO product (title,price,imageUrl,description) VALUES (?,?,?,?)',
    [
      this.title,this.price,this.imageUrl,this.description
    ]
    );
  }

  static deleteProductById(id){
    
  }

  static fetchAll() {
    return db.execute('SELECT * FROM product');
  }

  static findById(id){
    return db.execute('SELECT * FROM product WHERE id = ?',[id]);
  }

};
