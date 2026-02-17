module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.{js,ts}", "!src/**/node_modules/**"],
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
  // On CI (or cold Docker) this can exceed 30s.
  testTimeout: 120000,
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
};
