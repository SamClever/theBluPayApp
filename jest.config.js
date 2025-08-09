module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|react-clone-referenced-element|@react-native-async-storage)/)'
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/__tests__/App\\.test\\.tsx$'],
  passWithNoTests: true,
};
