# RD CAMPUSDEX — Testing Infrastructure Documentation

## Strategy
Our testing ecosystem is built on a layered architecture enforcing high production readiness. It combines lightning-fast unit tests, component tests via jsdom, integration tests on actual databases, security-specific boundary checks, and full-browser automation through Playwright.

## Run Commands
- `npm run test` — Run standard Vitest suite (Unit, Component, API).
- `npm run test:coverage` — Run Vitest suite with V8 coverage generation.
- `npm run test:db` — Run Database integration and migration checks against a real DB.
- `npm run test:e2e` — Run Playwright full browser testing.
- `npm run test:chaos` — Run Chaos/Failure injection suite.
- `npx stryker run` — Run mutation testing suite.

## Coverage Targets
Our CI/CD pipeline enforces the following coverage baselines strictly:
- **Global / Line / Branch / Functions**: `85%`
- **APIs**: `90%`
- **Authentication & Authorization**: `95%`
- **Upload Security**: `100%`
- **Password Reset**: `100%`

## Folder Architecture
- `tests/unit/`: Standalone deterministic logic (JWT, password hashers).
- `tests/components/`: React component rendering and interaction logic via `@testing-library/react`.
- `tests/api/`: Vitest wrappers testing Next.js App Router handlers directly.
- `tests/security/`: Targeted boundary limit and vulnerability tests (e.g., quota overages, authorization bypasses).
- `tests/database-integration/`: Real transactional boundaries and DB constraints.
- `tests/e2e/`: Full Playwright flows simulating real Student/Admin interactions in Chromium/Webkit/Firefox.
- `tests/chaos/`: Artificial API downtime and catastrophic failure simulations.
- `tests/accessibility/`: Axe-Core validations.
- `tests/business-critical/`: Macro-lifecycle tests ensuring multi-step domain boundaries.
- `tests/mocks/`: Contains `vitest-mock-extended` wrappers for Prisma (`prismaMock`).

## Writing a New Test
1. Identify the correct layer. Do not write an E2E test for something that can be verified via a Unit test.
2. For APIs, use `prismaMock` to prevent slow DB spin-ups unless it strictly requires `database-integration/`.
3. Use `@testing-library/user-event` instead of `fireEvent` wherever possible for realistic component simulation.

## Debugging
- If Playwright tests fail, check the automatically generated `playwright-report/` trace artifacts.
- If coverage falls below limits, check `coverage/index.html` to find unmapped code paths.
