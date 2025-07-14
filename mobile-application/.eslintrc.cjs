module.exports = {
    extends: [
        'universe',
        'universe/native',
        'universe/web',
        'universe/shared/typescript-analysis',
    ],
    overrides: [
        {
            files: ['*.ts', '*.tsx', '*.d.ts'],
            parserOptions: {
                project: './tsconfig.json',
            },
        },
    ],
    plugins: ['react-hooks'],
    rules: {
        'import/order': 'off',
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
    env: {
        node: true,
    },
};