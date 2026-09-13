import { authenticate } from '../lib/authenticate'
import { type GraphqlContextType, isWsContext, type User } from '../lib/types'
import type { CustomGraphqlContextType } from '../schema/lib/builder'
import { pubsub } from './pubsub'

/**
 * To initialize the context object with our custom fields.
 * Used as a middleware, when the request packet is entering.
 */
export const initGraphqlContext = (
  context: GraphqlContextType
): CustomGraphqlContextType => {
  return {
    currentUser: authenticate(context) as User,
    reqOrigin: isWsContext(context)
      ? context.extra.persistedRequest.headers.origin
      : context.res.reqOrigin,
    pubsub: pubsub,
  }
}
