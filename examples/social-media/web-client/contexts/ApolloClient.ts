import type { ApolloCache } from '@apollo/client'
import { ApolloClient, ApolloLink, HttpLink } from '@apollo/client'
import { LocalState } from '@apollo/client/local-state'
import { sharedConfig } from '@shared'
import { InMemoryCacheSynced, stateSyncLink } from 'apollo-state-sync'

const httpLink = new HttpLink({
  uri: sharedConfig.graphqlEndpoint,
})

/**
 * The Apollo Client instance for our graphql api endpoint.
 */
export const apolloClient = new ApolloClient({
  link: ApolloLink.from([stateSyncLink as unknown as ApolloLink, httpLink]),
  cache: new InMemoryCacheSynced() as unknown as ApolloCache,
  localState: new LocalState(),
})
