const Sequelize = require('sequelize');
//ojo que sequelize usa por dentro el paquete mysql2
//asi que este tambien debe estar instalado

//argumentos: db name, user, password, configuration(object)
const sequelize = new Sequelize('nodecomplete','root','root',{
    dialect: 'mysql',
    host: 'localhost',
    port: 8889
});

module.exports = sequelize;