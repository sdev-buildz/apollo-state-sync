/**
 * @packageDocumentation
 * {@inheritDoc getWebpackConfig}
 */

import { getWebpackConfig } from '@packages/web-app-utils/webpack-config'
import { sharedConfig } from '@shared'
import type webpack from 'webpack'

/**
 * The webpack configuration object.
 */
export const config = getWebpackConfig(sharedConfig)

/** For knip */
export default config as webpack.Configuration
