const db = require('./db.js')
const etl = require('./etl.js');
const Sequelize = require('sequelize');

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

  //console.log(`getting reviews for ${product_id}...`);
  // todo: handle no reviews, bad data
  return readReviewsForProductIdNoPhotos(product_id)
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

let readReviewsForProductIdNoPhotos = (product_id) => {

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
  });

}

let readReviewMetaForProductId = (product_id) => {

  //let promises = [];

  let newPromises = [];

  // calculate rating
  newPromises.push(db.Review.findAll({
      where: { product_id: product_id },
      attributes: ['rating', [Sequelize.fn('count', Sequelize.col('rating')), 'count']],
      group: ['rating']
    })
    .then(result => {
      // todo: sanity checks
      // strip SQL formatting of results, transform into object format
      let formattedResults = {};
      for (let i = 0; i < result.length; i++) {
        formattedResults[result[i].dataValues.rating] = result[i].dataValues.count;
      }
      return formattedResults;
    })
    .catch(err => console.log(err))
  );

  // calculate recommendation
  newPromises.push(db.Review.findAll({
    where: { product_id: product_id },
    attributes: ['recommend', [Sequelize.fn('count', Sequelize.col('recommend')), 'count']],
    group: ['recommend']
  })
    .then(result => {
      // todo: sanity checks
      // strip SQL formatting of results, transform into object format
      let formattedResults = {};
      for (let i = 0; i < result.length; i++) {
        formattedResults[result[i].dataValues.recommend] = result[i].dataValues.count;
      }
      return formattedResults;
    })
    .catch(err => console.log(err))
  );

  // calculate characteristics
  newPromises.push(db.Characteristic.findAll({
    where: { product_id: product_id },
    attributes: [
      'characteristic_id',
      'characteristic_name',
      [Sequelize.fn('sum', Sequelize.col('value')), 'sum'],
      [Sequelize.fn('count', Sequelize.col('characteristic_id')), 'count']
    ],
    group: ['characteristic_id', 'characteristic_name']
  })
  .then(result => {
    // todo: sanity checks
    // strip SQL formatting of results, transform into object format
    let formattedResults = {};
    for (let i = 0; i < result.length; i++) {
      formattedResults[result[i].dataValues.characteristic_name] = {
        id: result[i].dataValues.characteristic_id,
        value: result[i].dataValues.sum / result[i].dataValues.count
      };
    }
    return formattedResults;
  })
  .catch(err => console.log(err))
  );

  return Promise.all(newPromises)
    .then(results => {
      let meta = {};
      meta.product_id = product_id;
      meta.ratings = results[0];
      meta.recommended = results[1];
      meta.characteristics = results[2];
      return meta;
    })

};


let writeReview = (review) => {
  // required fields:
  // product_id
  // rating
  // summary
  // body
  // recommend
  // name
  // email
  // photos
  // characteristics
  /*
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
  reported: DataTypes.BOOLEAN
  */
  if (
    ('product_id' in review) &&
    ('rating' in review) &&
    ('summary' in review) &&
    ('body' in review) &&
    ('recommend' in review) &&
    ('name' in review) &&
    ('email' in review)) {
      let formattedReview = {
        product_id: review.product_id,
        rating: review.rating,
        summary: review.summary,
        recommend: review.recommend,
        reviewer_name: review.name,
        reviewer_email: review.email,
        response: '',
        body: review.body,
        date: Date.now(),
        helpfulness: 0,
        reported: 0
      };
      return db.Review.create(formattedReview)
        .then((result) => result.dataValues.review_id)
        .then((review_id) => {
          let photoAndCharacteristicWritePromises = [];
          if ('photos' in review && review.photos instanceof Array && review.photos.length > 0) {
            for (let i = 0; i < review.photos.length; i++) {
              let formattedPhoto = {
                review_id: review_id,
                url: review.photos[i]
              }
              photoAndCharacteristicWritePromises.push(db.Photo.create(formattedPhoto));
            }
          }
          if ('characteristics' in review && review.characteristics instanceof Object) {
            for (key in review.characteristics) {
              let formattedCharacteristic = {
                review_id: review_id,
                characteristic_id: key,
                product_id: review.product_id,
                value: review.characteristics[key]
              }
              photoAndCharacteristicWritePromises.push(
                db.Characteristic.findOne({
                  where: {
                    characteristic_id: key
                  }
                })
                  .then(matchingCharacteristic => {
                    return matchingCharacteristic.dataValues.characteristic_name;
                  })
                  .then(characteristic_name => {
                    formattedCharacteristic.characteristic_name = characteristic_name;
                    return db.Characteristic.create(formattedCharacteristic);
                  })
              );
            }
          }
          return Promise.all(photoAndCharacteristicWritePromises);
        })
        .catch((err) => console.error(err));
    } else {
      return new Error('Review missing required parameter(s)');
    }
}


let markReviewHelpful = (review_id) => {
  //todo: make sure helpful is not null, possibly change database schema?
  return db.Review.increment({helpful: 1}, {where: {review_id: review_id}});

}

let markReviewReported = (review_id) => {
  return db.Review.update({reported: 1}, {where: {review_id: review_id}});
}


module.exports = {createAndPopulateTables, readReviewsForProductId, readReviewMetaForProductId, writeReview, markReviewHelpful, markReviewReported};