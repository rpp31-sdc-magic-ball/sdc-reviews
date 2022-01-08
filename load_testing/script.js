import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 1 }, // 1 rps (actually 2 rps)
    { duration: '30s', target: 5 }, // 10 rps
    { duration: '30s', target: 50 }, // 100 rps
    { duration: '30s', target: 500 }, // 1000 rps
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
