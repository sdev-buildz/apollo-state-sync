/**
 * Bundles the frontend files for production.
 * Minimizes the CSS. Performs SSG (Static Site Generation).
 * @packageDocumentation
 */
import webpack from 'webpack'
import { getWebpackConfig } from './webpack.config.ts'

/**
 * Bundles for production deployment.
 */
export const webpackBundle = () => {
  const config = getWebpackConfig(undefined, false)

  webpack(config, (err, stats) => {
    if (err || stats?.hasErrors()) {
      console.error('Build failed:', err || stats?.compilation.errors)
      process.exit(1)
    }
    console.log('Build completed successfully!')
  })
}
