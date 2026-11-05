import js from '@eslint/js';
import globals from 'globals';

export default [
    {
        ignores: [
            'node_modules/**',
            'coverage/**',
            'reports/**',
            'eslint-*-report.json'
        ]
    },

    js.configs.recommended,

    {
        files: ['**/*.js'],

        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.node
        },

        rules: {
            'no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    caughtErrors: 'none'
                }
            ],

            'no-undef': 'error',
            'no-unreachable': 'error',
            'eqeqeq': 'error',
            'curly': 'error'
        }
    }
];