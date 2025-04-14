module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js'
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  transform: {
    '^.+\\.js$': 'babel-jest'
  }
};