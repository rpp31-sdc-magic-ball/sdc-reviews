const app = require('./app.js');
const request = require('supertest');

describe("Server is running", () => {
  test("Server responds to GET requests on /reviews/", () => {
    return request(app)
      .get('/reviews/')
      .then((res) => {
        expect(res.statusCode).toBe(200);
      });
  });
});