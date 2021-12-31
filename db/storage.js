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

let readReviewsForProductId = (product_id, page, count, sort) => {

  console.log(`getting reviews for ${product_id}...`);
  // todo: handle no reviews, bad data
  return db.Review.findAll({
    where: {
      product_id: product_id
    }
  });

}
/*
let readReviewMetaForProductId = (product_id) => {


  readReviewsForProductId(product_id)
    .then()
  // ex:
  // {
  //   "product_id": "2",
  //   "ratings": {
  //     2: 1,
  //     3: 1,
  //     4: 2,
  //     // ...
  //   },
  //   "recommended": {
  //     0: 5
  //     // ...
  //   },
  //   "characteristics": {
  //     "Size": {
  //       "id": 14,
  //       "value": "4.0000"
  //     },
  //     "Width": {
  //       "id": 15,
  //       "value": "3.5000"
  //     },
  //     "Comfort": {
  //       "id": 16,
  //       "value": "4.0000"
  //     },
  //     // ...
  // }


}

let writeReview = (review) => {

}

let markReviewHelpful = (review_id) => {

}

let markReviewReported = (review_id) => {

}


*/
module.exports = {createAndPopulateTables, readReviewsForProductId};