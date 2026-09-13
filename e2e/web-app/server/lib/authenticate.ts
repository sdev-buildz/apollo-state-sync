import { decryptJwe } from './jwe'
import type { GraphqlContextType } from './types'
import { isWsContext, type User } from './types'

/**
 *  Authenticates the user by parsing the bearer token in the HTTP Authorization header.
 */
export const authenticate = (context: GraphqlContextType): User | undefined => {
  const authHeader = isWsContext(context)
    ? context.connectionParams?.headers?.authorization
    : context.res.authHeader

  if (!authHeader) return
  const bearerToken = authHeader.startsWith('bearer ')
    ? authHeader.slice('bearer '.length)
    : authHeader

  const jwtPayload = decryptJwe(bearerToken)

  if (!jwtPayload) return

  const user = JSON.parse(jwtPayload)
  const currentUser = user
  return currentUser
}
