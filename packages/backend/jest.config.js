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
  testTimeout: 30000,
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
};
