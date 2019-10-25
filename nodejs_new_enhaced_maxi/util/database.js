const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    port: 8889,
    database: 'nodecomplete',
    user: 'root',
    password: 'root'
});

//exportamos un objeto PromisePool
module.exports = pool.promise();