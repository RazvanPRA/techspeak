module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@/features/*/*'],
            message:
              'Import other features only through their index.ts public API (modular-architecture §3).',
          },
        ],
      },
    ],
  },
};
