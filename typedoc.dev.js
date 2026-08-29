import packageJson from './package.json' with { type: 'json' }

/** @type {Partial<import("typedoc").TypeDocOptions>} */
export default {
  name: `${packageJson?.name ?? 'canonical-serialization.'} - Internal Architecture (Developers)`,
  entryPoints: ['./'],
  entryPointStrategy: 'expand',
  out: 'docs/generated/internal-architecture',
  exclude: [
    '**/dist/**',
    '**/docs/**',
    '**/generated/**',
    '**/node_modules/**',
  ],
  // readme: './README.md',
  plugin: ['@packages/typedoc-plugins/link-tag-plugin'],
  skipErrorChecking: true,
}
