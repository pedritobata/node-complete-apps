/* const getDB = require('../util/database').getDB;
const mongodb = require('mongodb');

class Product {
  //hemos puesto el id en el constructor para soportar la funcion de update tambien
  //pero la hemos puesto como ultimo argumento para que no malogre nuestras otras operaciones del CRUD!!
  constructor(title,price,description,imageUrl, id, userId){
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    //tranformamos a al objeto id que maneja mongo!!
    this._id = id ?  new mongodb.ObjectId(id) : null;
    this.userId = userId;
  }

  save(){
    const db = getDB();
    // mongo tiene muuchos metodos que puedo usar. ver la doc
    //recordar que si la collection no existe, mongo la creará al vuelo
    //ademas , mongo creará un id por defecto para cada insercion y lo llamará _id 
    //uso el return para devolver todo como una promesa (ya que todos los metodos de
    //mongo parecen devolver una promesa: insertOne, etc a parte de lod then, catch de las promesas en sí)
    //con esta devolucion en forma de promesa , podré trabajar en el controler como una promesa!!

    // usamos una variable para guardar la operacion que corresponda: create o update
    let dbOp;
    if(this._id){
      dbOp = db.collection('products').updateOne({ _id:  this._id},
                      { $set: this });
                      //el set tambien acepta un objeto detallando los unicos campos que quiero actualizar!!
    }else{
      dbOp = db.collection('products').insertOne(this)
    }
    

    return dbOp.then(result=>{
      console.log(result);
    })
    .catch(err=>console.log(err));

  }

  static fetchAll(){
    const db = getDB();
    //como siempre devuelvo una promesa
    return db.collection('products')
    .find()//find NO devuelve una promesa sino un cursor, el cual No trae tooodos los registros
    //porque estos pueden ser muchisimos. en cambio el cursor lo podria ir invocando de
    //a pocos, usando un metodo next()
    //en este caso hemos usado un metodo toArray() para que me traiga todos los registros
    //sabiendo que son pocos
    .toArray()
    .then(products=>{
      console.log(products);
      return products;//esto es lo que al final devuelvo, los productos dentro de una promise
    })
    .catch(err=>console.log(err));
  }

  static findById(prodId){
    const db = getDB();
    return db.collection('products')
    //importante: mongo guarda los id como un objeto de mongo llamado ObjectId
    //asi que hay que comparar dicho id con el nuestro pero a ese mismo nivel
           .find({_id: new mongodb.ObjectId(prodId)})// find acepta parametros de busqueda
           .next()//en este caso uso next porque quiero que me devuelva solo el primer resultado
           .then(product=>{
             console.log(product);
             return product
           })
           .catch(err=>console.log(err))
  }


  static deleteById(prodId){
    const db = getDB();
    return db.collection('products').deleteOne({_id: new mongodb.ObjectId(prodId)})
    .then(result=>{
      console.log('Product deleted!!!');
    })
    .catch(err=>console.log(err));
  }

}


module.exports = Product; */