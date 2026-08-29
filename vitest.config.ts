import { defaultExclude, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      include: [
        'src',
        'packages/apollo-shared-ws/src',
        'packages/common-utils/src',
        'packages/*/cli',
      ],
      exclude: [
        '**/generated',
        '**/dist',
        './packages/common-utils/src/mocks',
        './packages/common-utils/src/cli-utils',
        '**/tsconfig.*',
        './src/features/*/tests',
        './packages/apollo-shared-ws/src/lib/apollo-client-lib-internal.ts',
        './packages/apollo-shared-ws/src/lib/graphql-ws-lib-internal.ts',
      ],
    },
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    exclude: [...defaultExclude, '**/e2e', '**/dist', '**/generated'],
    globals: true,
  },
  resolve: {
    tsconfigPaths: true,
  },
})
