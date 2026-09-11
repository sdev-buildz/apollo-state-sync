import { type InMemoryCache } from '@apollo/client'
import {
  globalConfig,
  type CacheSyncerConfigType,
  type GlobalConfig,
} from '../../globalConfig'
import { setupBroadcastors } from './setupBroadcastors'
import { cacheBroadcastChannel } from './util/cacheBroadcastChannel'
import {
  shouldNotBroadcastSymbol,
  shouldNotPersistSymbol,
} from './util/in-memory-cache.types'
import type { InMemoryCacheSyncedType } from './util/InMemoryCacheSyncedType'
import { restorePersisted } from './util/persistance'

/**
 * Synchronizes the local cache with updates from other browsing contexts.
 *
 * This listener handles broadcasted cache operations (such as changes from other
 * tabs, or windows) and applies them to the current browsing context
 * to ensure data consistency.
 */
export const setupListeners = (
  inMemoryStore: InMemoryCacheSyncedType,
  config?: Pick<GlobalConfig, 'skipListenedFilter'>
) => {
  cacheBroadcastChannel.addEventListener('message', (event) => {
    const broadcastOperation = event.data
    if (
      config?.skipListenedFilter?.(
        broadcastOperation.operationName,
        broadcastOperation.args
      )
    )
      return // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(inMemoryStore[broadcastOperation.operationName] as any)(
      {
        ...(typeof broadcastOperation.args[0] !== 'string'
          ? broadcastOperation.args[0]
          : ({
              value: broadcastOperation.args[0],
            } satisfies Parameters<typeof inMemoryStore.retain>[0])),
        [shouldNotBroadcastSymbol]: true,
        [shouldNotPersistSymbol]: true,
      },
      ...broadcastOperation.args.slice(1)
    )
  })
}

/**
 * Sets up synchronization and persistance of Apollo Client's in-memory cache.
 * @example
 * ```ts
 * import { InMemoryCache } from '@apollo/client'
 * import { setupCacheSyncer, stateSyncLink } from 'apollo-state-sync'
 * import { terminatingLink } from './util/terminatingLink'
 *
 * // use setupCacheSyncer on inMemoryCache.
 * const inMemoryCache = setupCacheSyncer(
 *    new InMemoryCache()
 * )
 *
 * const apolloClient = new ApolloClient({
 *    //  use stateSyncLink. It is a non-terminating link.
 *    ApolloLink.from([stateSyncLink, terminatingLink]),
 *    cache: inMemoryCache,
 * })
 * ```
 */
export const setupCacheSyncer = (
  inMemoryStore: InMemoryCache,
  config?: CacheSyncerConfigType
): InMemoryCacheSyncedType => {
  restorePersisted(inMemoryStore)
  setupListeners(inMemoryStore, { ...globalConfig, ...config })
  setupBroadcastors(inMemoryStore, { ...globalConfig, ...config })

  return inMemoryStore
}
