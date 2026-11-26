/**
 * Quick availability check of the two public demo applications used by the suite.
 * Run it before a demo/pipeline run: the suite itself is deterministic, but the
 * demo targets are not under our control.
 *
 *   node scripts/check-targets.mjs
 */
const baseUrl = process.env.BASE_URL || 'https://practicesoftwaretesting.com';
const apiUrl = process.env.API_URL || 'https://restful-booker.herokuapp.com';

const targets = [
  { name: 'E2E  - Toolshop', url: baseUrl },
  { name: 'E2E  - Toolshop API', url: 'https://api.practicesoftwaretesting.com/products' },
  { name: 'API  - Restful-booker', url: `${apiUrl}/ping` },
];

let unhealthy = 0;

for (const target of targets) {
  const startedAt = Date.now();
  try {
    const response = await fetch(target.url, { method: 'GET', signal: AbortSignal.timeout(20_000) });
    const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
    const healthy = response.status < 500;
    if (!healthy) {
      unhealthy += 1;
    }
    console.log(`${healthy ? 'OK  ' : 'FAIL'} ${target.name.padEnd(26)} ${response.status} (${seconds}s) ${target.url}`);
  } catch (error) {
    unhealthy += 1;
    console.log(`FAIL ${target.name.padEnd(26)} --  ${error.message} ${target.url}`);
  }
}

console.log('');
console.log(unhealthy === 0 ? 'All targets are reachable - good to run the suite.' : `${unhealthy} target(s) unhealthy: expect flaky/failed runs.`);
process.exit(unhealthy === 0 ? 0 : 1);
