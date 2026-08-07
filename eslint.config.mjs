export default [
  {
    files: ['api/**/*.js', 'lib/**/*.js', 'dev-server.js', 'test/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        Buffer: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        fetch: 'readonly',
        URLSearchParams: 'readonly',
        module: 'readonly',
        process: 'readonly',
        require: 'readonly',
        setTimeout: 'readonly'
      }
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-redeclare': 'error'
    }
  }
];
