import packageJson from './package.json' with { type: 'json' }

/** @type {Partial<import("typedoc").TypeDocOptions>} */
export default {
  name: `${packageJson?.name ?? 'canonical-serialization.'} - API Reference (Users)`,
  entryPoints: ['src', 'src/for-worker-thread'],
  out: 'docs/generated/api-reference',
  exclude: ['dist', 'docs', '**/generated', 'node_modules'],
  skipErrorChecking: true,
  plugin: ['@packages/typedoc-plugins/link-tag-plugin'],
}
