# GKO Hybrid Framework

Production-grade Web + API hybrid test automation framework.
Built by [GatekeeperOps](https://gatekeeperops.ai) — AI Cloud QA Ops for FinTech SaaS.

---

## What It Does

- **UI testing** — Playwright end-to-end browser automation
- **API testing** — Playwright APIRequestContext with schema validation
- **Hybrid testing** — UI action + API assertion in the same test
- **CI/CD** — GitHub Actions pipeline with daily scheduled runs
- **Reporting** — Allure reports published to GitHub Pages

---

## Quick Start (New Client Onboarding)
```bash
# 1. Clone the framework
git clone https://github.com/gatekeeperops/gko-hybrid-framework
cd gko-hybrid-framework

# 2. Install dependencies
npm install
npx playwright install chromium

# 3. Configure client
cp client-configs/client-template.env .env
# Fill in BASE_URL, API_BASE_URL, AUTH_TYPE, USERNAME, PASSWORD

# 4. Run tests
npm run test:api      # API tests only
npm run test:ui       # UI tests only
npm run test:hybrid   # Hybrid tests only
npm run test          # All tests
```

---

## Project Structure
```
src/
  config/
    environment.ts        # Loads .env variables
    client.config.ts      # Per-client settings — only file to change
  api/
    client.ts             # Central API client wrapper
    endpoints/
      auth.api.ts         # Auth endpoints
      core.api.ts         # Core business endpoints
  pages/
    base.page.ts          # Base page object
    login.page.ts         # Login page
  fixtures/
    api.fixture.ts        # API client injection
    auth.fixture.ts       # Authenticated session
  schemas/
    api.schema.ts         # Zod response schemas
  utils/
    validator.ts          # Response validation helpers
    logger.ts             # Structured test logger
tests/
  api/                    # Pure API tests
  ui/                     # Pure UI tests
  hybrid/                 # UI + API combined tests
client-configs/
  client-template.env     # Copy this for each new client
.github/
  workflows/
    ci.yml                # GitHub Actions pipeline
```

---

## Per-Client Configuration

Only one file changes per client — `.env`:
```bash
CLIENT_NAME=acme-fintech
ENV_NAME=staging
BASE_URL=https://app.acmefintech.com
API_BASE_URL=https://api.acmefintech.com
AUTH_TYPE=bearer
USERNAME=test@acmefintech.com
PASSWORD=testpassword
API_TOKEN=your-api-token-here
```

---

## Running Tests
```bash
# By project
npm run test:api
npm run test:ui
npm run test:hybrid

# All tests
npm run test

# With UI (headed mode)
npm run test:headed

# Specific file
npx playwright test tests/hybrid/auth.hybrid.spec.ts

# Generate Allure report
npm run report
```

---

## CI/CD Pipeline

Tests run automatically on:
- Every push to `main` or `develop`
- Every pull request
- Daily at 6am UTC (production monitoring)
- Manual trigger from GitHub Actions UI

GitHub secrets required:
```
BASE_URL
API_BASE_URL
AUTH_TYPE
USERNAME
PASSWORD
API_TOKEN
```

---

## Adding a New Client

1. Clone repo
2. Copy `client-configs/client-template.env` → `.env`
3. Fill in client credentials
4. Update `src/api/endpoints/core.api.ts` endpoint paths
5. Update `src/pages/login.page.ts` selectors if needed
6. Add GitHub secrets for CI/CD
7. Run `npm run test` to verify

---

## Built With

| Layer | Technology |
|-------|------------|
| UI automation | Playwright + TypeScript |
| API testing | Playwright APIRequestContext |
| Schema validation | Zod |
| Reporting | Allure |
| CI/CD | GitHub Actions |
| Logging | Custom structured logger |

---

## Contact

**GatekeeperOps** — AI Cloud QA Ops for FinTech SaaS
- Website: [gatekeeperops.ai](https://gatekeeperops.ai)
- Email: [pardha@gatekeeperops.ai](mailto:pardha@gatekeeperops.ai)
- Book a call: [calendly.com/pardha-gatekeeperops/30min](https://calendly.com/pardha-gatekeeperops/30min)