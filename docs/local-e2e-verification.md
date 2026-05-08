# Local E2E Verification Guide

This guide helps maintainers run Shime Quiz's local Playwright smoke checks on Ubuntu, including the general smoke suite and the onboarding/demo quickstart suite.

## Purpose

Local E2E verification confirms that the built app can open in a real browser and that the release-candidate onboarding path still behaves safely. It is especially useful after touching Dashboard, Library, routing, import surfaces, demo quickstart copy, or release-readiness documentation.

Passing these commands in one local environment is useful evidence for that environment only. Do not describe automated E2E as passed unless the relevant command actually ran and completed successfully.

## Ubuntu/local assumptions

- Ubuntu Linux or a compatible local Linux environment.
- Node.js and npm are available.
- Repository dependencies are installed with `npm ci`.
- Playwright-managed Chromium is installed before running browser tests.
- EduGen is not required for onboarding E2E because the demo quickstart uses a bundled local sample.
- Document import E2E for PDF/DOCX/PPTX/ZIP would require a separately running, browser-reachable EduGen File Processor service if that path is tested.

## Install dependencies and browsers

Install project dependencies:

```bash
npm ci
```

Install Playwright Chromium:

```bash
npx playwright install chromium
```

If the browser starts but Linux system dependencies are missing, install Chromium with OS dependencies:

```bash
npx playwright install --with-deps chromium
```

## Build and run E2E smoke

Build first:

```bash
npm run build
```

Run the existing smoke suite:

```bash
npm run test:e2e:smoke
```

Run the onboarding/demo quickstart suite:

```bash
npm run test:e2e:onboarding
```

## Port conflicts on 4173/4174

The Playwright config may start or reuse a Vite preview server. If a previous preview process is still holding `127.0.0.1:4173` or `127.0.0.1:4174`, stop the stale process before rerunning the tests.

Helpful Ubuntu commands:

```bash
ss -ltnp | grep -E '4173|4174'
```

Then stop only the stale Node/Vite process that belongs to this local test run. Do not reset local app data or edit source code just to clear a port conflict.

## Missing Chromium / environment-blocked errors

A missing Playwright browser usually appears as an error like:

```text
browserType.launch: Executable doesn't exist
Please run npx playwright install
```

Classify this as a browser/environment issue, not an app failure. Install Chromium with `npx playwright install chromium` or `npx playwright install --with-deps chromium`, then rerun the E2E command.

## Failure classification

When a smoke command fails, classify the failure before requesting code changes:

- **App bug:** the browser launched, the app opened, and the observed behavior violates the expected product flow.
- **Test bug:** the app behavior is correct but the test selector, timing, or assertion is wrong.
- **Browser/environment issue:** Chromium is missing, Linux browser dependencies are missing, sandbox/browser launch is blocked, or a local port is occupied.
- **Timeout/flakiness:** the test sometimes passes but times out or races on load; collect logs before changing product code.
- **Selector issue:** UI copy or accessible names changed while the intended behavior still works; update the test carefully without weakening safety coverage.

## Claims control

Only claim automated E2E passed after the relevant command actually exits successfully, for example:

```bash
npm run test:e2e:onboarding
```

If Chromium is missing or browser launch is blocked, say the E2E run was environment-blocked. Do not claim the automated onboarding E2E passed in that environment.

Allowed after a real passing run:

- `npm run test:e2e:smoke` passed in the named environment.
- `npm run test:e2e:onboarding` passed in the named environment.

Not allowed without a real passing run:

- automated onboarding E2E passed without a real passing run;
- full browser smoke passed;
- production or security certification without separate evidence.

## Scope reminders

The onboarding E2E path does not require EduGen and does not call AI/API providers. It protects the local Dashboard-to-Library onboarding flow, the **Dùng quiz mẫu** quickstart, preview/validation/quality review visibility, and confirm-save safety.
