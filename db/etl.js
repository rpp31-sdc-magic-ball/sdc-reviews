const mysql = require('mysql');
const path = require('path');
const authentication = require('../authentication.js');

// this module uses the 'mysql' module to connect to the mariaDB.  I use 'sequelize' elsewhere, but it does not
// like to do local imports.  Neither does the 'mariadb' module.

const reviews_path = path.join(__dirname, '../data/reviews.csv');
const photos_path = path.join(__dirname, '../data/reviews_photos.csv');
const characteristics_path = path.join(__dirname, '../data/characteristics.csv');
const characteristic_reviews_path = path.join(__dirname, '../data/characteristic_reviews.csv');

let populateTables = () => {

  var con = mysql.createConnection({
    host: authentication.host,
    user: authentication.username,
    password: authentication.password,
    database: authentication.database
  });

  con.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');

    // ETL for reviews table

    console.log('Starting import of data into reviews table...');
    var reviewSQL = `load data local infile '${reviews_path}' into table reviews fields terminated by ',' enclosed by '"' lines terminated by '\n' ignore 1 lines (review_id, product_id, rating, @var, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) SET date = FROM_UNIXTIME(@var*0.001);`;

    con.query(reviewSQL, (err, result) => {
      if (err) throw err;
      console.log('successfully populated reviews table');
    })

    // ETL for photos table

    console.log('Starting import of data into photos table...');
    var photoSQL = `load data local infile '${photos_path}' into table photos fields terminated by ',' enclosed by '"' lines terminated by '\n' ignore 1 lines (photo_id, review_id, url);`;

    con.query(photoSQL, (err, result) => {
      if (err) throw err;
      console.log('successfully populated photos table');
    })

    // ETL for characteristics

    var tempCharSQL = `load data local infile '${characteristics_path}' into table tempCharacteristics fields terminated by ',' enclosed by '"' lines terminated by '\n' ignore 1 lines (id, product_id, name);`;

    var tempCharRevSQL = `load data local infile '${characteristic_reviews_path}' into table tempCharacteristics_reviews fields terminated by ',' enclosed by '"' lines terminated by '\n' ignore 1 lines (id, characteristic_id, review_id, value);`;

    var charRevJoinSQL = `INSERT INTO characteristics SELECT tempCharacteristics_reviews.id, tempCharacteristics_reviews.review_id, tempCharacteristics_reviews.characteristic_id, tempCharacteristics.product_id, tempCharacteristics.name, tempCharacteristics_reviews.value FROM tempCharacteristics INNER JOIN tempCharacteristics_reviews ON tempCharacteristics.id = tempCharacteristics_reviews.characteristic_id;`;

    // todo: the two temp tables can be imported at the same time

    console.log('Starting import of data into tempCharacteristics table...');
    con.query(tempCharSQL, (err, result) => {
      if (err) throw err;
      console.log('successfully populated tempCharacteristics table');
      console.log('Starting import of data into tempCharacteristics_reviews table...');
      con.query(tempCharRevSQL, (err, result) => {
        if (err) throw err;
        console.log('successfully populated tempCharacteristic_reviews table');
        console.log('Starting import of data into characteristics table...');
        con.query(charRevJoinSQL, (err, result) => {
          if (err) throw err;
          console.log('successfully populated characteristics table');
        })
      })
    })



  });

};

module.exports = { populateTables };

/**
// Manual SQL commands to load data from CSV:
//
//

load data local infile '/Users/richardwatterson/Documents/Galvanize/SDC/reviews/sdc-reviews/data/reviews.csv' into table reviews fields terminated by ',' enclosed by '"' lines terminated by '\n' ignore 1 lines (review_id, product_id, rating, @var, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) SET date = FROM_UNIXTIME(@var*0.001);

load data local infile '/Users/richardwatterson/Documents/Galvanize/SDC/reviews/sdc-reviews/data/reviews_photos.csv' into table photos fields terminated by ',' enclosed by '"' lines terminated by '\n' ignore 1 lines (photo_id, review_id, url);

load data local infile '/Users/richardwatterson/Documents/Galvanize/SDC/reviews/sdc-reviews/data/characteristics.csv' into table tempCharacteristics fields terminated by ',' enclosed by '"' lines terminated by '\n' ignore 1 lines (id, product_id, name);

load data local infile '/Users/richardwatterson/Documents/Galvanize/SDC/reviews/sdc-reviews/data/characteristic_reviews.csv' into table tempCharacteristics_reviews fields terminated by ',' enclosed by '"' lines terminated by '\n' ignore 1 lines (id, characteristic_id, review_id, value);

INSERT INTO characteristics SELECT tempCharacteristics_reviews.id, tempCharacteristics_reviews.review_id, tempCharacteristics_reviews.characteristic_id, tempCharacteristics.product_id, tempCharacteristics.name, tempCharacteristics_reviews.value FROM tempCharacteristics INNER JOIN tempCharacteristics_reviews ON tempCharacteristics.id = tempCharacteristics_reviews.characteristic_id;

*/