const app = require('./app.js');
const request = require('supertest');

describe('Server is running', () => {
  test('Server responds to GET requests on /reviews/', () => {
    return request(app)
      .get('/reviews')
      .then((res) => {
        expect(res.statusCode).not.toBe(404);  //should be 422 because no product_id provided, but not testing that here
      });
  });
  test('Server does NOT respond to GET requests on /products', () => {
    let requestPromises = [];
    return request(app)
      .get('/products')
      .then((res) => {
        expect(res.statusCode).toBe(404);
      });
  });
  test('Server does NOT respond to GET requests on /qa', () => {
    return request(app)
      .get('/qa')
      .then((res) => {
        expect(res.statusCode).toBe(404);
      });
  });
});

describe('GET requests to API endpoint /reviews responds as expected', () => {
  test('Request without product_id responds with status code 422', () => {
    return request(app)
      .get('/reviews')
      .then((res) => {
        expect(res.statusCode).toBe(422);
      });
  });
  test('Server should respond with an array', () => {
    return request(app)
      .get('/reviews?product_id=1')
      .then((res) => {
        console.log('res.body: ', res.body);
        expect(res.body).toBeInstanceOf(Array);
      });
  });
  test('Responses should match provided product_id', () => {
    return request(app)
      .get('/reviews?product_id=1')
      .then((res) => {
        console.log('res.body: ', res.body);
        expect(res.body[0]).toHaveProperty('product_id', 1);
      });
  });
  // more tests: page, count, sort

});