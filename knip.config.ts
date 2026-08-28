import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  ignoreFiles: [
    'packages/migration/tests/test-snapshot.ts',
    'packages/migration/**/test-source-files/**',
  ],
  ignoreDependencies: ['ts-morph', '@changesets/cli'],
  typedoc: {
    config: ['./typedoc.{config,dev}.js'],
  },
  workspaces: {
    'e2e/web-app': {
      webpack: {
        config: ['./webpack/webpack.config.ts'],
      },
    },
  },
}

export default config
