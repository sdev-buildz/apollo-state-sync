import packageJson from './package.json' with { type: 'json' }

/** @type {Partial<import("typedoc").TypeDocOptions>} */
export default {
  name: `${packageJson?.name ?? 'apollo-state-sync.'} - API Reference (Users)`,
  entryPoints: ['src', 'packages/apollo-shared-ws/src'],
  out: 'docs/generated/api-reference',
  exclude: ['dist', 'docs', '**/generated', 'node_modules'],
  skipErrorChecking: true,
  tsconfig: 'tsconfig.typedoc.json',
  plugin: ['@packages/typedoc-plugins/link-tag-plugin'],
  externalSymbolLinkMappings: {
    'apollo-shared-ws': {
      '*': 'https://www.npmjs.com/package/apollo-shared-ws',
    },
    typescript: {
      SharedWorker:
        'https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker',
    },
    global: {
      SharedWorker:
        'https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker',
    },
    'graphql-ws': {
      '*': 'https://the-guild.dev/graphql/ws',
    },
    'graphql-shared-ws': {
      '*': 'https://www.npmjs.com/package/graphql-shared-ws',
    },
    '@apollo/client': {
      InMemoryCacheConfig:
        'https://github.com/apollographql/apollo-client/blob/main/src/cache/inmemory/types.ts#L138',
      '*': 'https://www.apollographql.com/blog/announcing-apollo-client-4-0',
    },
    'canonical-serialization': {
      '*': 'https://www.npmjs.com/package/canonical-serialization',
    },
    graphql: {
      '*': 'https://www.npmjs.com/package/graphql',
    },
    'serialize-javascript': {
      '*': 'https://www.npmjs.com/package/serialize-javascript',
    },
  },
}
