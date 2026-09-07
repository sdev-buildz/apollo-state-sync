/**
 * {@inheritDoc config}
 * @see config
 */

import { logger } from '@packages/logger'
import sharedConfig from '@shared/config'

/**
 * The server's configuration object.
 * It abstracts the environment variables.
 */
const config = {
  sampleEnv: process.env.SAMPLE_ENV,
  ...sharedConfig,

  auth: {
    /**
     * Used in authorization header. The key must be 32 bytes (256 bits) for AES-256
     */
    jweKey:
      process.env.JWE_KEY ??
      (sharedConfig.environment === 'DEV' ? '1'.repeat(32) : ''),
  },
}

if (!config.auth.jweKey) {
  logger.error(
    `No JWE Key present. Provide a JWE_KEY environment variable and keep it secure from others.`,
    {
      readMoreAboutJwe: `https://datatracker.ietf.org/doc/html/rfc7516`,
    }
  )
  process.emit('SIGTERM')
}

config.auth.jweKey = config.auth.jweKey as string

export default config
