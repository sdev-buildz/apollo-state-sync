import { sharedConfig as defaultSharedConfig } from '@packages/web-app-utils/shared'

const apiServerOrigin = `https://graphqlzero.almansi.me`

/**
 * {@link defaultSharedConfig | config } for the web-app.
 */
export const sharedConfig = {
  ...defaultSharedConfig,
  origin: apiServerOrigin,
  graphqlEndpoint: `${apiServerOrigin}/api`,
} satisfies typeof defaultSharedConfig
