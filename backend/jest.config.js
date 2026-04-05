module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  setupFiles: ['./tests/setup.js'],
  testTimeout: 10000,
};
