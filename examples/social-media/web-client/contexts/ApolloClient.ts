import type { ApolloCache } from '@apollo/client'
import { ApolloClient, ApolloLink, HttpLink } from '@apollo/client'
import { LocalState } from '@apollo/client/local-state'
import { sharedConfig } from '@shared'
import { stateSyncLink } from 'apollo-state-sync'
import { inMemoryStore } from '../util/inMemoryStore.ts'

const httpLink = new HttpLink({
  uri: sharedConfig.graphqlEndpoint,
})

/**
 * The Apollo Client instance for our graphql api endpoint.
 * @see Cache {@link inMemoryStore}
 */
export const apolloClient = new ApolloClient({
  link: ApolloLink.from([stateSyncLink as unknown as ApolloLink, httpLink]),
  cache: inMemoryStore as unknown as ApolloCache,
  localState: new LocalState(),
})
