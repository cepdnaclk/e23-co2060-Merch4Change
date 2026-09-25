# Backend Testing Guide

The **Merch4Change** backend API uses Node.js's native test runner (`node --test`), delivering fast, zero-dependency test execution with built-in assertion utilities.

---

## Running Test Suites

Execute test commands from the `code/Backend` directory:

### Run Unit Tests
```bash
npm test
```
*(Executes all tests matching `tests/unit/**/*.test.js`)*

### Run Tests in Watch Mode
```bash
npm run test:watch
```
*(Automatically re-runs tests whenever source or test files change)*

### Run Integration Tests
```bash
npm run test:integration
```
*(Executes integration suites in `tests/integration/**/*.test.js`)*

### Run All Tests
```bash
npm run test:all
```
*(Runs both unit and integration suites in sequence)*

### Run a Specific Test File
```bash
node --test tests/unit/validators/profile.validator.test.js
```

---

## Test Suite Organization

```
tests/
├── unit/                       # Isolated unit tests for pure functions & helpers
│   ├── utils/                  # Token generators, formatters, and math helpers
│   └── validators/             # Input payload schemas and sanitizers
└── integration/                # API route integration tests with simulated DB calls
    ├── auth/                   # Registration, login, and token refresh tests
    ├── donations/              # Atomic coin donation & balance deduction tests
    └── products/               # Marketplace catalog query tests
```

---

## Notes for Developers

- **Windows PowerShell Users**: If script execution policies restrict `npm`, run commands using `npm.cmd test` or pass commands directly to `node --test`.
- **Environment Variables**: Tests run with `NODE_ENV=test`. Ensure your test configurations do not overwrite production database credentials.
- **Linting & Code Quality**: Always ensure tests adhere to project linting rules before committing:
  ```bash
  npm run lint
  ```
