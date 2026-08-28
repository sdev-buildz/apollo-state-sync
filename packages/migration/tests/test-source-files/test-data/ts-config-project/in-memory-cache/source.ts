import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { setupCacheSync } from 'apollo-state-sync'

export const invalidClient1 = new ApolloClient()

const invalidParam = undefined
export const invalidClient2 = new ApolloClient(invalidParam as any)

export const invalidClient3 = new ApolloClient({
  link: undefined,
  cache: {}
})

/**
 * Apollo Client
 */
export const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: '',
  }),
  cache: new InMemoryCache(),
})
/**
 * Apollo Client
 */
export const apolloClien2 = new ApolloClient({
  link: new HttpLink({
    uri: '',
  }),
  cache: setupCacheSync(new InMemoryCache()),
})
