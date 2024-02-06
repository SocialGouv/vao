module.exports = {
  verbose: false,
  testMatch: [
    "**/test/**/*test*.js",
    "**/*test*.js",
    "!**/mocha/**",
    "!**/playground/**",
    "!**/*test-helper*",
    "!**/*anti-pattern*", // Uncomment this only when you want to inspect the consequences of anti-patterns
    "!**/*performance*", // Uncomment this only when you want to inspect the performance of tests
  ],
  collectCoverage: false,
  coverageReporters: ["text-summary", "lcov"],
  collectCoverageFrom: [
    "**/*.js",
    "!**/node_modules/**",
    "!**/test/**",
    "!**/coverage/**",
  ],
  forceExit: true,
  testEnvironment: "node",
  notify: false,
  globalSetup: "./test/global-setup.js",
  globalTeardown: "./test/global-teardown.js",
};
