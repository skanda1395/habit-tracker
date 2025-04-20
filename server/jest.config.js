export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  setupFilesAfterEnv: ['./tests/setupTests.js'],
  globalTeardown: './tests/teardownTests.js',
};