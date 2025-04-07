module.exports = {
  // Use jsdom to simulate browser environment
  testEnvironment: 'jsdom',
  
  // Test file matching patterns
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Coverage collection settings
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js',
    '!**/node_modules/**'
  ],
  
  // Coverage threshold settings
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Module name mapping
  moduleNameMapper: {
    // Handle CSS imports
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    // Handle image imports
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  
  // Scripts to run before each test file
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  }
}; 