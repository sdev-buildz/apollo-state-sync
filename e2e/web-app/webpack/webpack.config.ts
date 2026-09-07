/**
 * @packageDocumentation
 * {@inheritDoc getWebpackConfig}
 */

import { getWebpackConfig } from '@packages/web-app-utils'
import type webpack from 'webpack'

/** For knip */
export default getWebpackConfig() as webpack.Configuration
