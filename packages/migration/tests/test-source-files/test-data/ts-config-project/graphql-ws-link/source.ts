import { ApolloLink } from '@apollo/client'
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

ApolloLink.from([wsLink])

const wsLink2 = new GraphQLWsLink(graphqlClient)
const splitLink = ApolloLink.split(
  () => false,
  new GraphQLWsLink(graphqlClient),
  wsLink2
)

const invalidClient = createClient2()
const wsLink3 = new GraphQLWsLink(invalidClient)