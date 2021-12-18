const db = require('./db.js')
const etl = require('./etl.js');

let createAndPopulateDBS = () => {

  let promises = [];
  promises.push(db.Review.sync());
  promises.push(db.Photo.sync());
  promises.push(db.Characteristic.sync());
  promises.push(db.tempCharacteristics.sync());
  promises.push(db.tempCharacteristics_Reviews.sync());
  Promise.all(promises).then(() => {

    etl.populateDatabases();

  });

};

module.exports = {createAndPopulateDBS}