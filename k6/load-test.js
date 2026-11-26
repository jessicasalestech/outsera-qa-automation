/**
 * k6 load test - optional challenge.
 *
 * Target: the public demo API of the practice e-commerce (Toolshop).
 * It is a read-only smoke/load test on purpose: /products and /products/{id}
 * are idempotent, so the test can push volume without creating garbage data
 * on a free public service.
 *
 * Scenarios (choose with SCENARIO):
 *   smoke (default): 5 VUs  for 30s   - validates the script and the baseline
 *   load           : 500 VUs for 5min - the scenario requested in the challenge
 *
 * Usage:
 *   k6 run -e SCENARIO=smoke k6/load-test.js
 *   k6 run -e SCENARIO=load --summary-export=reports/k6-summary.json k6/load-test.js
 *
 * Optional overrides:
 *   LOAD_API_URL - base URL of the API (default: https://api.practicesoftwaretesting.com)
 *   VUS          - override the number of virtual users
 *   DURATION     - override the duration (e.g. 2m)
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.LOAD_API_URL || 'https://api.practicesoftwaretesting.com';
const scenarioName = __ENV.SCENARIO === 'load' ? 'load' : 'smoke';

const businessErrors = new Rate('business_errors');
const listDuration = new Trend('products_list_duration', true);
const detailDuration = new Trend('product_detail_duration', true);

export const options = {
  scenarios: {
    [scenarioName]: {
      executor: 'constant-vus',
      vus: Number(__ENV.VUS) || (scenarioName === 'load' ? 500 : 5),
      duration: __ENV.DURATION || (scenarioName === 'load' ? '5m' : '30s'),
      gracefulStop: '10s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'], // < 1% HTTP errors
    http_req_duration: ['p(95)<1500'], // 95% of requests under 1.5s
    business_errors: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
};

export default function () {
  const list = http.get(`${BASE_URL}/products`, { tags: { endpoint: 'list_products' } });
  listDuration.add(list.timings.duration);

  const listOk = check(list, {
    'GET /products - status 200': (response) => response.status === 200,
    'GET /products - returns a paginated list': (response) => Array.isArray(response.json('data')),
  });
  businessErrors.add(!listOk);

  const products = list.status === 200 ? list.json('data') || [] : [];
  const product = products.length > 0 ? products[Math.floor(Math.random() * products.length)] : null;

  if (product) {
    const detail = http.get(`${BASE_URL}/products/${product.id}`, { tags: { endpoint: 'get_product' } });
    detailDuration.add(detail.timings.duration);
    businessErrors.add(
      !check(detail, {
        'GET /products/{id} - status 200': (response) => response.status === 200,
        'GET /products/{id} - same product': (response) => response.json('id') === product.id,
      }),
    );
  }

  sleep(1);
}
