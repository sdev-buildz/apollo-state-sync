/**
 * {@inheritdoc sharedConfig}
 * @packageDocumentation
 */

const apiServerPort: number = Number(
  process.env.PORT ?? (process.env.CI ? 3080 : 443)
)
const webClientPort: number = Number(process.env.WEB_CLIENT_PORT ?? 3000)

/**
 * The host configurations such as host name and port number.
 *
 * This file is accessible by both server and client side codes.
 * So, this file should not be used for secrets.
 */
export const sharedConfig = {
  /** Whether this server is hosted with HTTPS protocol or not */
  https: Boolean(process.env.HTTPS ?? true),

  /** The port of this server's endpoint */
  port: apiServerPort,

  /**
   * The host uri, on which this server is hosted.
   * This is same as this website's origin.
   */
  origin: process.env.ORIGIN ?? `https://localhost:${apiServerPort}`,

  /** The endpoint of the GraphQL API */
  graphqlEndpoint: '',

  graphqlSdlPath: './schema.graphql',

  webClientPort,

  /**
   * The origin of the frontend server.
   *  It is mostly the same as the origin of this server.
   */
  webClientOrigin:
    process.env.WEB_CLIENT_ORIGIN ??
    process.env.ORIGIN ??
    `https://localhost:${webClientPort}`,

  /** The port of this server's endpoint */
  environment: (process.env.IS_PRODUCTION === 'true' ? 'PROD' : 'DEV') as
    'PROD' | 'DEV',

  /**
   * To enable console logging in production.
   * It is enabled by default during development.
   */
  enableWinstonConsoleTransport:
    process.env.ENABLE_WINSTON_CONSOLE_TRANSPORT === 'true',

  /**
   * The path to the folder in which the frontend bundle is emitted by webpack
   */
  webClientBundlePath: './dist',
}

sharedConfig.graphqlEndpoint = sharedConfig.origin + '/api/graphql'
