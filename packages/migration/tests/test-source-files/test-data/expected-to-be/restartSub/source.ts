import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { InMemoryCacheSynced, setupRestartSubscription, SharedWebSocket, stateSyncLink } from 'apollo-state-sync'
import { createClient } from 'graphql-ws'

/**
 * graphqlClient
 */
export const graphqlClient = createClient({
  url: 'wss://localhost:443/api/graphql',
  connectionParams: {
    headers: {
      authorization: 'random-auth-header',
    },
  },
  webSocketImpl: SharedWebSocket
})

const wsLink = new GraphQLWsLink(graphqlClient)

//  This should be transformed.
const apolloClient = setupRestartSubscription(new ApolloClient({
  link: ApolloLink.from([stateSyncLink, ApolloLink.from([wsLink])]),
  cache: new InMemoryCacheSynced() as InMemoryCache
}), { sharedClient: graphqlClient })

//  These should not transformed.
const wsLink2 = new GraphQLWsLink(graphqlClient)
const splitLink = ApolloLink.split(
  () => false,
  new GraphQLWsLink(graphqlClient),
  wsLink2
)

const apolloClient2 = new ApolloClient({
  link: ApolloLink.from([stateSyncLink, ApolloLink.from([splitLink])]),
  cache: new InMemoryCacheSynced() as InMemoryCache
})
const gqlClient = createClient({
  url: 'wss://localhost:443/api/graphql',
  connectionParams: {
    headers: {
      authorization: 'random-auth-header',
    },
  },
  webSocketImpl: SharedWebSocket
})
const wsLink3 = new GraphQLWsLink(
  gqlClient
)

//  This should be transformed.
const apolloClient3 = setupRestartSubscription(new ApolloClient({
  link: ApolloLink.from([stateSyncLink, ApolloLink.from([wsLink3])]),
  cache: new InMemoryCacheSynced() as InMemoryCache
}), { sharedClient: gqlClient })
