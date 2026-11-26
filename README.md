# Outsera — QA Automation (API + E2E)

[![QA Pipeline](https://github.com/jessicasalestech/outsera-qa-automation/actions/workflows/ci.yml/badge.svg)](https://github.com/jessicasalestech/outsera-qa-automation/actions/workflows/ci.yml)

**English** · [Português (BR)](./README.pt-BR.md)

Automated test suite for the Outsera technical assessment: **API tests** (full CRUD + authentication,
positive and negative scenarios) and **E2E tests written in Gherkin/Cucumber**, both in TypeScript with
Playwright. It also ships a **GitHub Actions pipeline** and an **optional k6 load test**.

| Suite | System under test | Tool |
| --- | --- | --- |
| API | [Restful-booker](https://restful-booker.herokuapp.com) (public demo API) | Playwright `APIRequestContext` |
| E2E | [Practice Software Testing – Toolshop](https://practicesoftwaretesting.com) (demo e-commerce) | Playwright + playwright-bdd (Cucumber/Gherkin) |
| Load (optional) | [Toolshop API](https://api.practicesoftwaretesting.com/products) (read-only) | k6 |

---

## 1. Project structure

```
outsera-qa-automation/
├── .github/workflows/ci.yml      # CI pipeline: API job + E2E job + optional k6 job
├── docs/
│   ├── RELATORIO-TESTES.md       # test report (results, findings, evidence)
│   ├── GUIA-APRESENTACAO.md      # how to present/explain this project
│   └── evidence/                 # screenshots of the main flows
├── k6/load-test.js               # optional load test (500 VUs / 5 min scenario + smoke)
├── scripts/
│   ├── check-targets.mjs         # availability check of the demo applications
│   └── ci-summary.mjs            # Markdown summary of the JSON report (GitHub Actions)
├── src/
│   ├── api/
│   │   ├── booking.client.ts     # HTTP client (single point of contact with the API)
│   │   ├── booking.factory.ts    # test data factory
│   │   └── types.ts              # API contract types
│   ├── config/env.ts             # environment/config in one place (.env driven)
│   └── pages/                    # Page Objects for the web UI
│       ├── account.page.ts
│       ├── checkout.page.ts
│       ├── home.page.ts
│       ├── login.page.ts
│       └── product.page.ts
├── tests/
│   ├── api/                      # API specs + custom fixtures
│   │   ├── auth.spec.ts
│   │   ├── booking.spec.ts
│   │   └── fixtures.ts
│   └── e2e/                      # Cucumber suite
│       ├── features/             # Gherkin (.feature)
│       ├── steps/                # step definitions
│       └── fixtures.ts           # test instance with the page objects
├── playwright.config.ts          # two projects: api and e2e
├── tsconfig.json
├── .env.example
└── package.json
```

---

## 2. Versions and dependencies

| Dependency | Version |
| --- | --- |
| Node.js | >= 20.10 (validated on 24.x) |
| TypeScript | 7.0 |
| @playwright/test | 1.65 |
| playwright-bdd | 9.2 |
| dotenv | 18.0 |
| k6 (optional) | 0.5x – 1.x |

Everything is installed through npm; there is no database, no Docker and no local server to configure.

---

## 3. Installation

```bash
# 1. clone
git clone https://github.com/jessicasalestech/outsera-qa-automation.git
cd outsera-qa-automation

# 2. dependencies
npm ci

# 3. browser used by the E2E suite
npx playwright install chromium

# 4. (optional) local configuration
cp .env.example .env
```

> The suite runs **without a `.env` file**: the default values are the public demo data of the
> applications under test. `.env` exists to point the tests to another environment or to override
> credentials.

---

## 4. How to run

| Command | What it does |
| --- | --- |
| `npm test` | runs API + E2E |
| `npm run test:api` | API suite (22 tests) |
| `npm run test:e2e` | generates the BDD specs (`bddgen`) and runs the Gherkin suite (8 scenarios) |
| `npm run test:e2e:headed` | same, with the browser visible |
| `npm run test:e2e:ui` | Playwright UI mode (great for demoing) |
| `npm run report` | opens the HTML report of the last run |
| `npm run typecheck` | TypeScript static analysis |
| `npm run k6:smoke` / `npm run k6:load` | load test, smoke (5 VUs/30s) or full (500 VUs/5min) |

---

## 5. Coverage

### 5.1 API — Restful-booker

| Method | Scenario | Expected |
| --- | --- | --- |
| GET | `/ping` health check | 201 |
| GET | `/booking` list | 200, JSON array with numeric ids |
| GET | `/booking/{id}` full contract | 200, types validated (number/boolean/nested dates) |
| GET | `/booking?firstname=&lastname=` filter | 200, returns the created id |
| GET | unknown id | 404 `Not Found` |
| POST | `/booking` valid payload | 200, `bookingid` + payload echoed |
| POST | read-after-write | 200, data persisted |
| POST | missing required fields | 500 (documented API defect) |
| POST | malformed JSON | 400 |
| PUT | `/booking/{id}` with token | 200, body updated and persisted |
| PUT | without token / invalid token | 403 `Forbidden` |
| PUT | unknown id | 405 |
| PATCH | partial update with token | 200, untouched fields preserved |
| PATCH | without token | 403 |
| DELETE | `/booking/{id}` with token | 201, then 404 on GET |
| DELETE | without token | 403 |
| DELETE | twice | 201 then 405 |
| POST | `/auth` valid credentials | 200, token returned |
| POST | `/auth` wrong password / unknown user / empty payload | 200 + `Bad credentials` (documented quirk) |

### 5.2 E2E — Gherkin scenarios

`tests/e2e/features/login.feature`

| Scenario | Type |
| --- | --- |
| Successful login with valid credentials | positive |
| Login with a wrong password | negative |
| Login with an unregistered user | negative |
| Login with empty required fields | negative |

`tests/e2e/features/checkout.feature`

| Scenario | Type |
| --- | --- |
| Complete a purchase with valid data (cart → address → card → invoice) | positive |
| Checkout is blocked when the delivery address is incomplete | negative |
| Payment is refused when the card number is invalid | negative |
| Payment is refused when the card is expired | negative |

---

## 6. Reports

Every run writes three formats:

| File | Use |
| --- | --- |
| `reports/html/index.html` | interactive HTML report (open with `npm run report`) |
| `reports/results.json` | machine-readable results (used by the CI summary) |
| `reports/junit.xml` | JUnit, consumed by most CI dashboards |

On failure Playwright keeps **screenshot, video and trace** in `test-results/` — the trace can be opened
with `npx playwright show-trace <file>.zip` and shows every step, DOM snapshot and network call.
A summary of the last execution is in [`docs/RELATORIO-TESTES.md`](./docs/RELATORIO-TESTES.md).

---

## 7. CI/CD

`.github/workflows/ci.yml` runs on every `push`/`pull_request` to `main` (and manually via
`workflow_dispatch`):

```
push / pull request
        │
        ├── job api-tests ──────── npm ci → npm run test:api → summary + artifacts
        │
        ├── job e2e-tests ──────── npm ci → playwright install chromium → npm run test:e2e
        │
        └── job load-test (manual) ─ k6 smoke run → k6 summary artifact
```

* jobs run in parallel; the API job takes ~1 min, the E2E job ~3 min;
* each job writes a Markdown summary to the run page (`$GITHUB_STEP_SUMMARY`);
* the HTML/JSON/JUnit reports and the failure evidence are uploaded as artifacts (7 days);
* `concurrency` cancels an outdated run when a new commit arrives on the same branch.

---

## 8. Design decisions (and why)

| Decision | Reason |
| --- | --- |
| **Playwright for API and UI** | one runner, one language, one report for both layers — less setup, less maintenance |
| **playwright-bdd (Cucumber)** | Gherkin syntax required by the assessment, but executed by the Playwright runner (auto-wait, trace, parallelism, fixtures) |
| **Page Object Pattern** | UI selectors in a single place; steps read like the business rule |
| **Custom fixtures** | page objects injected into steps; API client and auth token injected into API tests (no duplicated setup) |
| **Data factory** | every test creates its own data and deletes it on teardown → independent and repeatable tests |
| **`data-test` selectors / semantic roles** | resilient to layout changes; no brittle CSS chains or XPath |
| **No `waitForTimeout`** | Playwright auto-waiting + web assertions keep the suite stable and fast |
| **Config via environment** | `.env`/secrets drive URLs and credentials — nothing hardcoded, nothing secret committed |
| **E2E with `workers: 1`** | the demo site shares one customer account and one server-side cart; serial execution avoids state collisions |
| **Negative tests assert the real behaviour** | when the API returns `500` for a missing field, the test documents the defect instead of hiding it |
| **CI retries** | public demo environments occasionally hiccup; retries are limited to CI and still surface real failures |

### Scope notes

* **Mobile (Appium)** — not implemented. It was listed as optional, and delivering it would require a
  device farm and an app build for no extra signal in this assessment. The API layer of the mobile app
  is already covered by the API suite.
* **k6** — the script supports both the requested scenario (500 VUs / 5 min) and a smoke scenario,
  and it is **read-only** on purpose: `/products` and `/products/{id}` are idempotent, so the test can
  push volume without writing garbage to a free public API. Results of the validations run locally are
  in [`docs/RELATORIO-TESTES.md`](./docs/RELATORIO-TESTES.md) (5 VUs and 50 VUs). The full 500 VUs / 5 min
  scenario is available with `npm run k6:load`, but it was not executed against a shared public service.

### Known limitations

* The suite depends on two **public demo applications**. They are normally healthy, but they are not
  under our control (they can be slow or unavailable). If a run fails on navigation/timeout, check the
  target availability first — the assertions themselves are deterministic.
* The demo e-commerce saves the billing address to the customer profile; the tests always fill the
  address explicitly, so they are immune to that persistence.

---

## 9. Author

**Jessica Sales** — QA Analyst
[github.com/jessicasalestech](https://github.com/jessicasalestech)

Project delivered as the practical part of the Outsera technical assessment.
