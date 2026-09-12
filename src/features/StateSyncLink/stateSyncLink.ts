import { ApolloLink } from '@apollo/client'
import type { createSharedClient } from 'graphql-shared-ws'
import { catchError, finalize, map } from 'rxjs'
import { synchronizationDebouncer } from '../../util/synchronizationDebouncer'

/**
 * A non-terminating {@link ApolloLink}, which tracks the count of in-flight GraphQL requests.
 * @remarks
 * This link is **required** when using the `apollo-state-sync` library.
 * @see [diagram](assets/sync-debouncer.png) that explains the logic with an example.
 * @example
 * ```ts
 * import { GraphQLWsLink } from '@apollo/client'
 * import { stateSyncLink } from 'apollo-state-sync'
 * import { createSharedClient } from 'graphql-shared-ws'
 *
 * const wsLink = new GraphQLWsLink(
 *   createSharedClient({
 *     url: 'wss://localhost:443/api/graphql',
 *   })
 * )
 *
 * const apolloClient = new ApolloClient({
 *   link: ApolloLink.from([
 *     authMiddleware,
 *
 *     // use stateSyncLink
 *     stateSyncLink,
 *
 *     wsLink,
 *   ]),
 *   cache: inMemoryStore,
 * })
 * ```
 */
export const stateSyncLink = new ApolloLink((operation, forward) => {
  /** GraphQL Subscriptions should be handled using {@link createSharedClient | Apollo Shared WS}. */
  if (operation.operationType === 'subscription') return forward(operation)

  synchronizationDebouncer.graphqlRequestStarted(operation)

  return forward(operation).pipe(
    map((response) => {
      synchronizationDebouncer.graphqlRequestCompleted(operation)
      return response
    }),
    finalize(() => {
      synchronizationDebouncer.graphqlRequestCompleted(operation)
    }),
    catchError((err) => {
      synchronizationDebouncer.graphqlRequestCompleted(operation)
      throw err
    })
  )
})
