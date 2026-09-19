/**
 * @packageDocumentation
 * {@inheritDoc getWebpackConfig}
 */

import { getWebpackConfig } from '@packages/web-app-utils'
import type webpack from 'webpack'

/**
 * the webpack config
 */
export const config = getWebpackConfig()

/** For knip */
export default config as webpack.Configuration
