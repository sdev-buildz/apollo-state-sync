import { defineConfig } from 'tsdown'

const baseConfig: Parameters<typeof defineConfig>[number] = {
  outDir: 'dist',

  //  "tsc --build" is done after "tsdown" build. So tsconfig: true will throw "missing types".
  tsconfig: false,
  dts: {
    build: false,
  },

  deps: {
    neverBundle: ['ts-morph', 'typescript'],
  },

  // Clean the dist directory before building
  clean: true,
  // Optional: Generate source maps for debugging
  sourcemap: true,
  treeshake: true,
  minify: true,
}

export default defineConfig([
  {
    //  The main bundle
    ...baseConfig,
    entry: {
      index: './src',
    },
    format: ['esm', 'cjs'],
  },
  {
    //  The bin (cli)
    ...baseConfig,
    entry: {
      bin: 'bin/cliApp',
    },
    format: ['esm'],
    outDir: 'dist/bin',
  },
])
