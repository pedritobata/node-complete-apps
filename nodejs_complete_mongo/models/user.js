const mongodb = require('mongodb');
const getDB = require('../util/database').getDB;

class User {
    constructor(username, email){
        this.username = username;
        this.email = email;
    }

    save(){
        const db = getDB();
        return db.collection('users').insertOne(this);
    }

    static findById(userId){
        const db = getDB();
        //tambien se puede usar find() y luego next() . recordar que find() devuelve un cursor
        return db.collection('users').findOne({_id: new mongodb.ObjectId(userId)});
    }

}

module.exports = User;