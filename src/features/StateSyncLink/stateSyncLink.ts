import { ApolloLink } from '@apollo/client'
import type { createSharedClient } from 'graphql-shared-ws'
import { catchError, map } from 'rxjs'
import { synchronizationDebouncer } from '../../util/synchronizationDebouncer'

/**
 * A non-terminating {@link ApolloLink}.  
 * Tracks the count of in-flight graphql requests.
 * It must be used when using the 'apollo-state-sync' library.
 *
 * This diagram explains the logic with an example:
 *    ![alt text](assets/sequence_diagram-debouncer.png)
 *    ![alt text](C://projects/gql-multiple-repos/apollo-state-sync/src/assets/sequence_diagram-debouncer.png)
 *    ![alt text](src/assets/architecture-diagram.svg)
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
  /** GraphQL Subscriptions should be handled using {@link createSharedClient}. */
  if (operation.operationType === 'subscription') return forward(operation)

  synchronizationDebouncer.graphqlRequestStarted()
  return forward(operation).pipe(
    map((response) => {
      synchronizationDebouncer.graphqlRequestCompleted()
      return response
    }),
    catchError((err) => {
      synchronizationDebouncer.graphqlRequestCompleted()
      throw err
    })
  )
})
