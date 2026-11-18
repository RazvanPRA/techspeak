module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // zod v4 uses `export * as ns from`, which the RN preset does not transform
    '@babel/plugin-transform-export-namespace-from',
    ['module-resolver', { root: ['./'], alias: { '@': './src' } }],
  ],
};
