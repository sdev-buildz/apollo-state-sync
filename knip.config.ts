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
    'packages/web-app-utils': {
      webpack: {
        config: ['./src/node/webpack.config.ts'],
      },
    },
    'e2e/web-app': {
      webpack: {
        config: ['./webpack/webpack.config.ts'],
      },
    },
  },
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join('\n'),
  },
}

export default config
