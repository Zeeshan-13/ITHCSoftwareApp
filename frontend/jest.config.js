export default {
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/tests/polyfills.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js'
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  transform: {
    '^.+\\.js$': ['babel-jest', {
      presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
      plugins: ['@babel/plugin-transform-modules-commonjs']
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(whatwg-url|webidl-conversions)/)'
  ]
};