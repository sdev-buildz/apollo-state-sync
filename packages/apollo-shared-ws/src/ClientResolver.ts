import type { ApolloLink } from '@apollo/client'
import type { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import type { SharedClient } from 'graphql-shared-ws'

/**
 * @see {@link ClientResolver}
 */
export type ClientResolverOperation = Omit<
  ApolloLink.Operation,
  'setContext' | 'getContext' | 'extensions' | 'variables'
> &
  Partial<Pick<ApolloLink.Operation, 'extensions' | 'variables'>>

/**
 * Given a graphql operation, returns the {@link SharedClient} to use.
 *
 * It is useful only when {@link ApolloLink.split} is used.
 * It should return the {@link SharedClient} associatad with the {@link GraphQLWsLink}
 *      routed to by {@link ApolloLink.split} for the given operation.
 * @returns The client if it is a {@link SharedClient}, undefined otherwise.
 * @example
 * ```ts
 * import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client'
 * import { HttpLink } from '@apollo/client/link/http'
 * import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
 * import { OperationTypeNode } from 'graphql'
 * import { createSharedClient } from 'graphql-shared-ws'
 * import { setupRestartSubscription } from 'apollo-shared-ws'
 *
 * //   GraphQL API endpoint served over wss.
 * const apiSharedClient = createSharedClient({ url: 'wss://api.example.com/graphql' })
 *
 * //   GraphQL performance reporting endpoint served over wss.
 * const perfSharedClient = createSharedClient({ url: 'wss://perf.example.com/graphql' })
 *
 * //   Given an operation, returns the SharedClient associated with
 * //       the GraphQLWsLink which will be invoked for this operation.
 * const clientResolver: ClientResolver = (operation) => {
 *   if (operation.operationType !== OperationTypeNode.SUBSCRIPTION) return undefined
 *
 *   if (operation.operationName?.startsWith('api')) {
 *     return apiSharedClient
 *   }
 *
 *   return perfSharedClient
 * }
 *
 * const apiLink = new GraphQLWsLink(apiSharedClient)
 * const perfLink = new GraphQLWsLink(perfSharedClient)
 *
 * const wsLink = ApolloLink.split(
 *   ({ operationName }) => Boolean(operationName?.startsWith('api')),
 *   apiLink,
 *   perfLink
 * )
 *
 * const httpLink = new HttpLink({ uri: 'https://example.com/graphql' })
 *
 * const link = ApolloLink.split(
 *   ({ operationType }) => Boolean(operationType === OperationTypeNode.SUBSCRIPTION),
 *   wsLink,
 *   httpLink
 * )
 *
 * const client = new ApolloClient({
 *   link,
 *   cache: new InMemoryCache(),
 * })
 *
 * setupRestartSubscription(client, {
 *   // Provide the clientResolver to the setupRestartSubscription function.
 *   sharedClientResolver: clientResolver,
 * })
 * ```
 */
export type ClientResolver = (
  operation: ClientResolverOperation
) => SharedClient | undefined
