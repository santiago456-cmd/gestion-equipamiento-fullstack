import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        setupFiles: ['./tests/setup.ts'],
        globals: true,
        environment: 'node',
        testTimeout: 15000,
        hookTimeout: 15000,
        fileParallelism: false
    }
})