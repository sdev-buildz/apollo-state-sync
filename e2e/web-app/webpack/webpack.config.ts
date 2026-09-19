/**
 * @packageDocumentation
 * {@inheritDoc getWebpackConfig}
 */

import { getWebpackConfig } from '@packages/web-app-utils/webpack-config'
import sharedConfig from '@shared/config'
import type webpack from 'webpack'

/**
 * the webpack config
 */
export const config = getWebpackConfig(sharedConfig)

/** For knip */
export default config as webpack.Configuration
