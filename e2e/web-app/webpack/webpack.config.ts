/**
 * @packageDocumentation
 * {@inheritDoc getWebpackConfig}
 */

import { getWebpackConfig } from '@packages/web-app-utils'
import path from 'path'
import type webpack from 'webpack'

const config = getWebpackConfig()
config.output!.path = path?.resolve?.(import.meta.dirname, '../dist') ?? 'dist'

/** For knip */
export default config as webpack.Configuration
