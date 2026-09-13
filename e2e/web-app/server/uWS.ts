/**
 * @packageDocumentation
 * @see uWS - {@link uWS}
 */
import path from 'path'
import { SSLApp } from 'uWebSockets.js'
import { getGraphqlApiHandler } from './lib/graphqlApiHandler'
import { graphqlWsHandler } from './util/graphqlWsHandler'
import { yoga } from './util/yogaServerInstance'

/**
 * The uWebSockets server app instance.
 * All the routes and handlers are mounted onto this instance.
 */
export const uWS = SSLApp({
  cert_file_name: path.join(import.meta.dirname, `./cert/cert.pem`),
  key_file_name: path.join(import.meta.dirname, `./cert/cert.key`),
})

uWS.any('/api/*', getGraphqlApiHandler(yoga)).ws('/api/*', graphqlWsHandler)
// .any('/.well-known/appspecific/com.chrome.devtools.json', (res, req) => {
//   /**
//    * This request is sent automatically by browser when developing using localhost.
//    */
//   res.end('', true)
// })
