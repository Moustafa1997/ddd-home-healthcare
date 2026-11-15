module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.ts$': 'ts-jest' },
  moduleNameMapper: { '^@app/(.*)$': '<rootDir>/src/$1' },
  collectCoverageFrom: ['src/**/*.ts'],
  testEnvironment: 'node',
};
