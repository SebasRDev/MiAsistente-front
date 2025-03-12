import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: true,
});

const eslintConfig = [
  {
    ignores: [
      '.next/*',
      'node_modules/*',
      'public/*',
      '**/*.d.ts', // Ignora archivos de definición de tipos
      'coverage/*',
      'dist/*',
    ],
  },
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'plugin:import/recommended',
    'plugin:import/typescript'
  ),
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // Reglas de TypeScript
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-interface': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/ban-ts-comment': [
        'warn',
        {
          'ts-ignore': 'allow-with-description',
          minimumDescriptionLength: 10,
        },
      ],

      // Reglas de React/Next
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'warn',

      // Reglas de importación
      'import/no-unresolved': 'off', // Next.js maneja las rutas
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // Reglas generales
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'prefer-const': 'warn',
      'no-undef': 'error',
    },
  },
  {
    // Reglas específicas para archivos de componentes
    files: ['**/components/**/*.tsx', '**/app/**/*.tsx', '**/pages/**/*.tsx'],
    rules: {
      // Puedes añadir reglas específicas para los componentes
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    // Reglas menos estrictas para archivos de prueba
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
];

export default eslintConfig;
