import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 }, // below normal load
    { duration: '30s', target: 20 }, // normal load
    { duration: '10s', target: 30 }, // around the breaking point
    { duration: '10s', target: 40 }, // beyond the breaking point
    { duration: '1m', target: 0 }, // scale down. Recovery stage.
  ],
};

export default function () {
  const BASE_URL = 'http://localhost:3001'; // make sure this is not production

  let randomProductId = Math.floor(Math.random()*1000000);

  const responses = http.batch([
    ['GET', `${BASE_URL}/reviews?product_id=${randomProductId}`, null, { tags: { name: 'PublicCrocs' } }],
    ['GET', `${BASE_URL}/reviews/meta?product_id=${randomProductId}`, null, { tags: { name: 'PublicCrocs' } }]
  ]);

  sleep(5);
}
