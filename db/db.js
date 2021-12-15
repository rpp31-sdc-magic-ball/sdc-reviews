const { Sequelize, Model, DataTypes } = require('sequelize');
const authentication = require('../authentication.js')
const db = new Sequelize(authentication.database, authentication.username, authentication.password, {
  host: authentication.host,
  dialect: 'mariadb'
});

db.authenticate().then(() => {console.log('Connection has been established successfully.')});