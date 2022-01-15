const {Sequelize, DataTypes} = require('sequelize');
const authentication = require('../authentication.js')
const db = new Sequelize(authentication.database, authentication.username, authentication.password, {
  host: authentication.host,
  port: authentication.port,
  dialect: 'mariadb',
  logging: false,
  dialectOptions: {
    flags: 'local-infile=1'
  },
});

// Database Schemata
let Review = db.define('reviews', {
  review_id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  product_id: DataTypes.INTEGER,
  rating: DataTypes.INTEGER,
  summary: DataTypes.STRING,
  recommend: DataTypes.BOOLEAN,
  reviewer_name: DataTypes.STRING,
  reviewer_email: DataTypes.STRING,
  response: DataTypes.STRING,
  body: DataTypes.STRING,
  date: DataTypes.DATE,
  helpfulness: DataTypes.INTEGER,
  reported: DataTypes.BOOLEAN
},
{
  timestamps: false,
  indexes: [{
    unique: false,
    fields: ['product_id']
  }]
});

let Photo = db.define('photos', {
  photo_id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  review_id: DataTypes.INTEGER,
  url: DataTypes.STRING
},
{
  timestamps: false,
  indexes: [{
    unique: false,
    fields: ['review_id']
  }]
});

let Characteristic = db.define('characteristics', {
  table_id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  review_id: DataTypes.INTEGER,
  characteristic_id: DataTypes.INTEGER,
  product_id: DataTypes.INTEGER,
  characteristic_name: DataTypes.STRING,
  value: DataTypes.STRING
},
{
  timestamps: false,
  indexes: [{
    unique: false,
    fields: ['product_id']
  }]
});

Review.hasMany(Photo, {foreignKey: 'review_id'});
Photo.belongsTo(Review, {foreignKey: 'review_id'});

Review.hasMany(Characteristic, {foreignKey: 'review_id'});
Characteristic.belongsTo(Review, {foreignKey: 'review_id'});

// temporary tables for ETL of previous database
let tempCharacteristics = db.define('tempCharacteristics', {
  id: {type: DataTypes.INTEGER, primaryKey: true},
  product_id: DataTypes.INTEGER,
  name: DataTypes.STRING
},
{ timestamps: false });

let tempCharacteristics_Reviews = db.define('tempCharacteristics_reviews', {
  id: {type: DataTypes.INTEGER, primaryKey: true},
  characteristic_id: DataTypes.INTEGER,
  review_id: DataTypes.INTEGER,
  value: DataTypes.INTEGER
},
{ timestamps: false});

module.exports = {Review, Photo, Characteristic, tempCharacteristics, tempCharacteristics_Reviews};