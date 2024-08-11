import { fileURLToPath, URL } from 'url';

import { defineConfig } from 'vitest/config'

export default defineConfig
({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@@': fileURLToPath(new URL('./tests', import.meta.url)),
        }
    },
    test: {
        coverage: {
            provider: 'v8',
        },
        globals: true,
        setupFiles: './tests/setup.js',
    },
});
