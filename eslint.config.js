import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';

export default [
  {
    ignores: ['dist/**/*']
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  firebaseRulesPlugin.configs['flat/recommended']
]
