module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  // The RN preset's pattern, plus ESM-only packages used by Redux Toolkit and navigation.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|immer|@reduxjs|react-redux)/)',
  ],
};
