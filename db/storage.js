const db = require('./db.js')
const etl = require('./etl.js');

let createAndPopulateTables = () => {

  // create tables (if not exist)
  let promises = [];
  promises.push(db.Review.sync());
  promises.push(db.Photo.sync());
  promises.push(db.Characteristic.sync());
  promises.push(db.tempCharacteristics.sync());
  promises.push(db.tempCharacteristics_Reviews.sync());
  Promise.all(promises).then(() => {

    // when all tables are confirmed to be created
    db.Review.findAll({
      where: {
        review_id: 1
      }
    })
      .then((res) => {
        if (res.length === 0) {
          // if the first row in reviews table does not exist, populate tables
          etl.populateTables();
        } else {
          // tables already populated, continue
          console.log('tables appear to already be populated, skipping...');
        }
      });
  });

};

module.exports = {createAndPopulateTables}