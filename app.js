const express = require("express");
const app = express();
//app.use(express.urlencoded({extended: true}));  //for GET request with params in URL
app.use(express.json());  // for POST requests with JSON in the body

// req.body === json data in body of POST request
// req.params.id === app.get(/reviews/:id)
// req.query === query params (localhost/reviews?param=value)


const storage = require('./db/storage.js');

storage.createAndPopulateTables();

//
// Endpoints
//

// GET /reviews/
//
// Parameter	Type	Description
// page	integer	Selects the page of results to return. Default 1.
// count	integer	Specifies how many results per page to return. Default 5.
// sort	text	Changes the sort order of reviews to be based on "newest", "helpful", or "relevant"
// product_id	integer	Specifies the product for which to retrieve reviews.

app.get('/reviews', (req, res) => {

  console.log('Accepting GET request to /reviews, query: ', req.query);

  // check for required parameter
  if (!('product_id' in req.query)) {
    res.status(422).send('Error: no product_id provided');
  }
  // default parameters
  if (!('page' in req.query)) {
    req.query.page = 1;
  }
  if (!('count' in req.query)) {
    req.query.count = 5;
  }
  if (!('sort' in req.query)) {
    req.query.sort = 'relevant';
  }

  // database access
  // send results


  res.sendStatus(201);

});

// GET /reviews/meta
//
// product_id	integer	Required ID of the product for which data should be returned

app.get('/reviews/meta', (req, res) => {

  console.log('Accepting GET request to /reviews/meta, query: ', req.query);

  //check for required parameter
  if (!('product_id' in req.query)) {
    res.status(422).send('Error: no product_id provided');
  }

  // database access / calculations
  // send results

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

  res.sendStatus(201);

});

// POST /reviews
//
// Parameter	Type	Description
// product_id	integer	Required ID of the product to post the review for
// rating	int	Integer (1-5) indicating the review rating
// summary	text	Summary text of the review
// body	text	Continued or full text of the review
// recommend	bool	Value indicating if the reviewer recommends the product
// name	text	Username for question asker
// email	text	Email address for question asker
// photos	[text]	Array of text urls that link to images to be shown
// characteristics	object	Object of keys representing characteristic_id and values representing the review value for that characteristic. { "14": 5, "15": 5 //...}

app.post('/reviews', (req, res) => {

  console.log('Accepting POST request to /reviews/meta, body: ', req.body);

  // database access, save review

  res.sendStatus(201);

});

// PUT /reviews/:review_id/helpful

app.put('/reviews/:review_id/helpful', (req, res) => {

  console.log('Marking review as helpful: ', req.params.review_id);

  // database access, update review

  res.sendStatus(204);

});

// PUT /reviews/:review_id/report

app.put('/reviews/:review_id/report', (req, res) => {

  console.log('Reporting review: ', req.params.review_id);

  // database access, update review

  res.sendStatus(204);

});


module.exports = app;