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
}
