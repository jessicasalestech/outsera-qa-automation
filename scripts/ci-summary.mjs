/**
 * Builds a small Markdown summary of a Playwright JSON report and prints it.
 * Used by the GitHub Actions pipeline ($GITHUB_STEP_SUMMARY) and locally:
 *
 *   node scripts/ci-summary.mjs "API tests" reports/results.json
 */
import { readFileSync } from 'node:fs';

const [label = 'Tests', reportFile = 'reports/results.json'] = process.argv.slice(2);

const flattenSpecs = (suite, acc = []) => {
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      const results = test.results ?? [];
      const last = results[results.length - 1] ?? {};
      acc.push({ title: spec.title, status: last.status ?? 'skipped', duration: last.duration ?? 0 });
    }
  }
  for (const child of suite.suites ?? []) {
    flattenSpecs(child, acc);
  }
  return acc;
};

let report;
try {
  report = JSON.parse(readFileSync(reportFile, 'utf8'));
} catch (error) {
  console.log(`## ${label}\n\n> Report not found (${reportFile}): ${error.message}`);
  process.exit(0);
}

const tests = report.suites.flatMap((suite) => flattenSpecs(suite));
const count = (status) => tests.filter((test) => test.status === status).length;
const passed = count('passed');
const failed = count('failed');
const skipped = count('skipped');
const flaky = count('timedOut') + count('interrupted');
const totalSeconds = (tests.reduce((sum, test) => sum + test.duration, 0) / 1000).toFixed(1);

const icon = (value) => (value > 0 ? '❌' : '✅');

console.log(`## ${label}`);
console.log('');
console.log('| Metric | Value |');
console.log('| --- | --- |');
console.log(`| Total | ${tests.length} |`);
console.log(`| Passed | ✅ ${passed} |`);
console.log(`| Failed | ${icon(failed)} ${failed} |`);
console.log(`| Aborted / timed out | ${flaky} |`);
console.log(`| Skipped | ${skipped} |`);
console.log(`| Execution time | ${totalSeconds}s |`);
console.log('');

if (failed + flaky > 0) {
  console.log('### Failed tests');
  console.log('');
  for (const test of tests.filter((t) => t.status === 'failed' || t.status === 'timedOut' || t.status === 'interrupted')) {
    console.log(`- \`${test.title}\` (${test.status})`);
  }
  console.log('');
}
