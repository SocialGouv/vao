module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,ts}",
    "!src/**/__tests__/**",
    "!src/**/node_modules/**",
  ],
  coverageDirectory: "coverage",
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  roots: ["<rootDir>/src"],
  setupFiles: ["<rootDir>/jest.setup.js"],
  testEnvironment: "node",
  testMatch: ["**/?(*.)+(spec|test).[tj]s"],
  // Some suites start a Postgres testcontainer and run multiple SQL init scripts.
  // On CI (or cold Docker) this can exceed 10s.
  testTimeout: process.env.CI ? 30000 : 10000,
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
};
