const Sequelize = require('sequelize');
const sequelize = require('../util/database');

//definimos nuestro objeto manejado por sequelize
//el primer argumento es el nombre de la tabla
const Product = sequelize.define('product',
{
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  //si solo especifico el tipo, puedo prescindir de definir un objeto para
  //configurar este campo
  title: Sequelize.STRING,
  price: {
    type: Sequelize.DOUBLE,
    allowNull: false
  },
  imageUrl: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = Product;