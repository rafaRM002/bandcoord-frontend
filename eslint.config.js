/**
 * @file eslint.config.js
 * @module eslint-config
 * @description Configuración de ESLint para el proyecto BandCoord. Incluye reglas recomendadas de JavaScript y React, integración con plugins de React Hooks y React Refresh, y ajustes para variables globales, parser y reglas personalizadas. Permite mantener la calidad y consistencia del código fuente.
 * @author Rafael Rodriguez Mengual
 */

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  // Ignora la carpeta de distribución
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Reglas recomendadas de JS y React Hooks
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      //'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'no-unused-vars': 'off',
      // Permite exportaciones constantes solo para componentes con React Refresh
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
