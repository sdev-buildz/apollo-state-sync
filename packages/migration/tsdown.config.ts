import { defineConfig } from 'tsdown'

export default defineConfig({
  // Specify your library entry point
  entry: {
    index: './src/index.ts',
  },
  // Output both ES Modules and CommonJS formats
  format: ['esm', 'cjs'],
  outDir: './dist',
  // Automatically generate .d.ts and .d.cts files
  dts: {
    build: false,
  },
  tsconfig: false,

  deps: {
    neverBundle: [
      'typescript',
      // 'ts-morph',
      // 'typescript/typescript6@^6.0.2',
    ],
  },

  // Clean the dist directory before building
  clean: true,
  // Optional: Generate source maps for debugging
  sourcemap: true,
  treeshake: true,
  minify: true,
})
