module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.{js,ts}", "!src/**/node_modules/**"],
  coverageDirectory: "coverage",
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  roots: ["<rootDir>/src"],
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
};
