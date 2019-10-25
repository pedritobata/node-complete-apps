const Sequelize = require('sequelize');

//argumentos: db name, user, password, configuration(object)
const sequelize = new Sequelize('nodecomplete','root','root',{
    dialect: 'mysql',
    host: 'localhost',
    port: 8889
});

module.exports = sequelize;