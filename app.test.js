const app = require('./app.js');
const request = require('supertest');

describe('Server is running', () => {
  test('Server responds to GET requests on /reviews/', () => {
    return request(app)
      .get('/reviews/')
      .then((res) => {
        expect(res.statusCode).toBe(200);
      });
  });
  test('Server does NOT respond to GET requests on other endpoints', () => {
    let requestPromises = [];
    requestPromises.push(request(app)
      .get('/products/')
      .then((res) => {
        expect(res.statusCode).toBe(404);
      }));
    requestPromises.push(request(app)
      .get('/qa/')
      .then((res) => {
        expect(res.statusCode).toBe(404);
      }));
    return Promise.all(requestPromises);
  });
});