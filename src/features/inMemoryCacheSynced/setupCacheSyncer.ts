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
 * Listens to broadcasted cache operations emitted from other browsing contexts.
 * Applies the operations in the current browsing context.
 */
export const setupListeners = (
  inMemoryStore: InMemoryCacheSyncedType,
  config?: Pick<GlobalConfig, 'skipListenedFilter'>
) => {
  cacheBroadcastChannel.addEventListener('message', (event) => {
    const broadcastedOperation = event.data
    if (
      config?.skipListenedFilter?.(
        broadcastedOperation.operationName,
        broadcastedOperation.args
      )
    )
      return // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(inMemoryStore[broadcastedOperation.operationName] as any)(
      {
        ...(typeof broadcastedOperation.args[0] !== 'string'
          ? broadcastedOperation.args[0]
          : ({
              value: broadcastedOperation.args[0],
            } satisfies Parameters<typeof inMemoryStore.retain>[0])),
        [shouldNotBroadcastSymbol]: true,
        [shouldNotPersistSymbol]: true,
      },
      ...broadcastedOperation.args.slice(1)
    )
  })
}

/**
 * Sets up synchronization and persistance of Apollo Client's in-memory cache.
 * Internally, it uses {@link BroadcastChannel} and local storage.
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
