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
  })
  .then(result => {
    // todo: sanity checks
    // strip SQL formatting of results
    let formattedResults = [];
    for (let i = 0; i < result.length; i++) {
      formattedResults.push(result[i].dataValues);
    }
    return formattedResults;
  })
  .then(reviews => {
    //get photos
    let photoPromises = reviews.map(review => {
      // get photos for each review
      return db.Photo.findAll({
        where: {
          review_id: review.review_id
        }
      });
    });
    return Promise.all(photoPromises)
      .then(rawPhotos => {
        // get relevant data from photo results and add to review
        let formattedReviews = [];
        for (let i = 0; i < reviews.length; i++) {
          for (let j = 0; j < rawPhotos[i].length; j++) {
            let photoObject = {
              id: rawPhotos[i][j].photo_id,
              url: rawPhotos[i][j].url
            };
            if (!('photos' in reviews[i])) {
              reviews[i].photos = [photoObject];
            } else {
              reviews[i].photos.push(photoObject);
            }
          }
        }
        return reviews;
      });
  })

};

let readReviewMetaForProductId = (product_id) => {

  let promises = [];

  promises.push(readReviewsForProductId(product_id)
    .then(result => {
      if (!(result instanceof Array)) {
        throw new Error(`No results for product_id ${product_id}, can't calculate meta`);
      }
      // construct metadata from product reviews
      let meta = {};
      meta.product_id = product_id;
      meta.ratings = {};
      meta.recommended = {};
      for (let i = 0; i < result.length; i++) {
        if ('rating' in result[i]) {
          // count instances of each rating value
          if (result[i].rating in meta.ratings) {
            meta.ratings[result[i].rating]++;
          } else {
            meta.ratings[result[i].rating] = 1;
          }
        }
        if ('recommend' in result[i]) {
          // count 'true' and 'false' recommend values
          if (result[i].recommend in meta.recommended) {
            meta.recommended[result[i].recommend]++;
          } else {
            meta.recommended[result[i].recommend] = 1;
          }
        }
      }
      return meta;
    }));

  promises.push(db.Characteristic.findAll({
    where: {
      product_id: product_id
    }
  })
    .then(rawResult => {
      // strip SQL formatting of results
      let formattedResult = [];
      for (let i = 0; i < rawResult.length; i++) {
        formattedResult.push(rawResult[i].dataValues);
      }
      return formattedResult;
    })
    .then(result => {
      // sum all ratings for each characteristic, and total rating count
      let characteristics = {};
      for (let i = 0; i < result.length; i++) {
        if (result[i].characteristic_name in characteristics) {
          characteristics[result[i].characteristic_name].sum += Number(result[i].value);
          characteristics[result[i].characteristic_name].num++;
        } else {
          characteristics[result[i].characteristic_name] = {
            id: result[i].characteristic_id,
            sum: Number(result[i].value),
            num: 1
          };
        }
      }
      // divide sum of ratings by total rating count to get average rating per characteristic
      for (name in characteristics) {
        characteristics[name].value = characteristics[name].sum / characteristics[name].num;
        delete characteristics[name].sum;
        delete characteristics[name].num;
      }

      return characteristics;
    }));

    // when meta from reviews table and meta from characteristics table resolve, combine and return
    return Promise.all(promises).then(results => {
      results[0].characteristics = results[1];
      return results[0];
    });

};

/*
let writeReview = (review) => {

}

let markReviewHelpful = (review_id) => {

}

let markReviewReported = (review_id) => {

}


*/
module.exports = {createAndPopulateTables, readReviewsForProductId, readReviewMetaForProductId};