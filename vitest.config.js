import { defineConfig } from 'vitest/config'

export default defineConfig
({
    test: {
        coverage: {
            provider: 'v8'
        },
        globals: true,
        setupFiles: './tests/setup.js',
    },
});
