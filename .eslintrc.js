module.exports = {
    env: {
      browser: true,
      es2021: true,
    },
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'prettier'
    ],
    overrides: [
      {
        env: {
          node: true,
        },
        files: [
          '.eslintrc.{js,cjs}',
        ],
        parserOptions: {
          sourceType: 'script',
        },
      },
    ],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      "import/prefer-default-export": ["off"],
      "react/jsx-uses-react": [1],
      "react/react-in-jsx-scope": ["off"],
      "react/prop-types": ["off"],
      "no-unused-vars": ["off"],
      "no-undef": ["off"]
    },
  };
