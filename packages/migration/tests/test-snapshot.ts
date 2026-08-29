import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

/**
 * Apollo Client
 */
export const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: '',
  }),
  cache: new InMemoryCache(),
})
