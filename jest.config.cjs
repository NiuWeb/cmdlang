/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    "node_modules/((@bygdle.*)/)": "esbuild-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(@bygdle.*)/)"
  ],
};