module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    plugins: [
      // NativeWind Tailwind support
      'nativewind/babel',
      // Path aliases — must come before reanimated
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/services',
            '@store': './src/store',
            '@types': './src/types',
            '@utils': './src/utils',
            '@hooks': './src/hooks',
            '@navigation': './src/navigation',
            '@assets': './assets',
          },
        },
      ],
      // Reanimated MUST be last
      'react-native-reanimated/plugin',
    ],
  };
};
