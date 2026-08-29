import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client'
import { InMemoryCacheSynced, setupCacheSync, stateSyncLink } from 'apollo-state-sync'

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
  link: ApolloLink.from([stateSyncLink, new HttpLink({
    uri: '',
  })]),
  cache: new InMemoryCacheSynced() as InMemoryCache,
})
/**
 * Apollo Client
 */
export const apolloClien2 = new ApolloClient({
  link: ApolloLink.from([stateSyncLink, new HttpLink({
    uri: '',
  })]),
  cache: setupCacheSync(new InMemoryCacheSynced() as InMemoryCache),
})
