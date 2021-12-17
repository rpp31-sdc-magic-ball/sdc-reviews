const {Sequelize, DataTypes} = require('sequelize');
const authentication = require('../authentication.js')
const db = new Sequelize(authentication.database, authentication.username, authentication.password, {
  host: authentication.host,
  dialect: 'mariadb'
});

//db.authenticate().then(() => {console.log('Connection has been established successfully.')});

// Database Schemata
let Review = db.define('reviews', {
  review_id: {type: DataTypes.INTEGER, primaryKey: true},
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
  reported: DataTypes.INTEGER
},
{ timestamps: false });

let Photo = db.define('photos', {
  photo_id: {type: DataTypes.INTEGER, primaryKey: true},
  review_id: DataTypes.INTEGER,
  url: DataTypes.STRING
},
{ timestamps: false });

let Characteristic = db.define('characteristics', {
  table_id: {type: DataTypes.INTEGER, primaryKey: true},
  review_id: DataTypes.INTEGER,
  characteristic_id: DataTypes.INTEGER,
  characteristic_name: DataTypes.STRING,
  value: DataTypes.STRING
},
{ timestamps: false });

Review.hasMany(Photo, {foreignKey: 'review_id'});
Photo.belongsTo(Review, {foreignKey: 'review_id'});

Review.hasMany(Characteristic, {foreignKey: 'review_id'});
Characteristic.belongsTo(Review, {foreignKey: 'review_id'});

module.exports = {Review, Photo, Characteristic};

/**
// Manual commands to load data from CSV:
//
//
load data local infile '/Users/richardwatterson/Downloads/reviews.csv' into table reviews fields terminated by ',' enclosed by '"' lines terminated by '\n' ignore 1 lines (review_id, product_id, rating, @var, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) SET date = FROM_UNIXTIME(@var*0.001);

*/