const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const mongoConnect = (callback) => {
    MongoClient.connect('mongodb+srv://pedro:R@tamacue1@cluster0-rw1t7.mongodb.net/test?retryWrites=true&w=majority')
    .then(client=>{
        console.log('Connected to Mongo!!');
        callback(client);
    })
    .catch(err=>console.log(err))
};

module.exports = mongoConnect;