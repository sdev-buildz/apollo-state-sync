import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
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
})

const wsLink = new GraphQLWsLink(graphqlClient)

//  This should be transformed.
const apolloClient = new ApolloClient({
  link: ApolloLink.from([wsLink]),
  cache: new InMemoryCache()
})

//  These should not transformed.
const wsLink2 = new GraphQLWsLink(graphqlClient)
const splitLink = ApolloLink.split(
  () => false,
  new GraphQLWsLink(graphqlClient),
  wsLink2
)

const apolloClient2 = new ApolloClient({
  link: ApolloLink.from([splitLink]),
  cache: new InMemoryCache()
})

const wsLink3 = new GraphQLWsLink(
  createClient({
    url: 'wss://localhost:443/api/graphql',
    connectionParams: {
      headers: {
        authorization: 'random-auth-header',
      },
    },
  })
)

//  This should be transformed.
const apolloClient3 = new ApolloClient({
  link: ApolloLink.from([wsLink3]),
  cache: new InMemoryCache()
})