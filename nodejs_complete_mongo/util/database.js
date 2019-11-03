const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
    //observar que en la cadena de conexion se esta enviando el user,password y la bd(shop)
    //como ya sabia, mongo crea la bd sobre la marcha, no es necesario crearla antes!!!
    MongoClient.connect('mongodb+srv://pedro:R@tamacue1@cluster0-rw1t7.mongodb.net/shop?retryWrites=true&w=majority')
    .then(client=>{
        console.log('Connected to Mongo!!');
        _db = client.db();//este metodo devuelve la db como objeto para ser usado con todos sus metodos
        // es decir, nos devuelve una conexion creada por mongo en su pool , el cual soporta multiples conecciones
        callback();
    })
    .catch(err=>{
        console.log(err);
        throw err;
    });
};

//con este metodo nos evitamos de estar creando conexiones cada vez que consultemos la BD
//la conexion se guarda en la variable _db la primera vez que app.js invocó a mongoConnect()!!!
const getDB = ()=>{
    if(_db){
        return _db;
    }
    throw 'No se pudo obtener la BD!!';
};


module.exports.mongoConnect = mongoConnect;
module.exports.getDB = getDB;