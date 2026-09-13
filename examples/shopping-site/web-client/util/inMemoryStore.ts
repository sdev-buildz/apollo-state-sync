import type { ApolloCache, TypedDocumentNode } from '@apollo/client'
import {
  type InMemoryCache,
  type InMemoryCacheConfig,
  type NormalizedCacheObject,
  gql,
} from '@apollo/client'
import type { Query } from '@types-gen-react-apollo'
import { InMemoryCacheSynced } from 'apollo-state-sync'

declare global {
  interface Window {
    /**
     * Set by the server during SSR.
     * It contains the state of the cache with data prefetched during SSR within server.
     */
    __APOLLO_STATE__?: NormalizedCacheObject
  }
}

/**
 * Initializes im memory cache with:
 * 1) data from local storage which was persited during past session.
 * 2) data prefetched during SSR within server.
 */
const setupCache = (): ApolloCache => {
  const inMemoryCacheConfig: InMemoryCacheConfig & {
    // typePolicies: TypedTypePolicies
  } = {
    typePolicies: {
      Mutation: {
        fields: {
          setMutableField: {
            merge(_, incoming, options) {
              options.cache.writeQuery({
                query: gql`
                  query queriable {
                    mutableField
                  }
                ` as TypedDocumentNode<Pick<Query, 'mutableField'>>,
                data: {
                  mutableField: incoming,
                },
              })
              return incoming
            },
          },
        },
      },
    },
  }
  /** The in memory cache */
  const inMemoryStore = new InMemoryCacheSynced(
    inMemoryCacheConfig as ConstructorParameters<typeof InMemoryCacheSynced>[0]
  )

  /** Restoring the cache state from SSR. */
  if (window.__APOLLO_STATE__) inMemoryStore.restore(window.__APOLLO_STATE__)

  // return inMemoryStore as InMemoryCache
  return inMemoryStore as unknown as InMemoryCache
}

/**
 *  The in-memory cache.
 */
export const inMemoryStore = setupCache()
