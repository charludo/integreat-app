export default {
  rootDir: 'src/',
  preset: 'ts-jest',
  verbose: true,
  automock: false,
  setupFiles: ['<rootDir>/../jest.setup.ts'],
  moduleDirectories: ['node_modules'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  maxWorkers: '50%',
  coverageDirectory: '<rootDir>/../reports/coverage',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/../reports/unit-test'
      }
    ]
  ]
}
