import type { InMemoryCache } from '@apollo/client'
import type { GlobalConfig } from '../../globalConfig'
import { synchronizationDebouncer } from '../../util/synchronizationDebouncer'
import type { InMemoryCacheSynced } from './InMemoryCacheSynced'
import { cacheBroadcastChannel } from './util/cacheBroadcastChannel'
import {
  cacheOperationsToSync,
  shouldNotBroadcastSymbol,
  shouldNotPersistSymbol,
  type CacheOperationsToSyncType,
} from './util/in-memory-cache.types'
import type { InMemoryCacheSyncedType } from './util/InMemoryCacheSyncedType'
import { persistInMemoryCache } from './util/persistance'

/**
 * Broadcasts the arguments of cache operations.
 */
export const broadcast = <OperationName extends CacheOperationsToSyncType>(
  operationName: OperationName,
  args: Parameters<InMemoryCacheSyncedType[OperationName]>
) => {
  synchronizationDebouncer.debounce(() => {
    cacheBroadcastChannel.postMessage({
      operationName: operationName,
      args,
    })
  })
}

/**
 * @returns whether the cache operation should be broadcasted or not.
 */
export const getShouldBroadcast = <
  OperationName extends CacheOperationsToSyncType,
>(
  operationName: OperationName,
  args: Parameters<InMemoryCacheSyncedType[OperationName]>,
  config?: Pick<GlobalConfig, 'skipBroadcastFilter'>
): boolean => {
  const shouldNotBroadcast: boolean =
    (typeof args[0] !== 'string' && args[0]?.[shouldNotBroadcastSymbol]) ||
    Boolean(config?.skipBroadcastFilter?.(operationName, args))
  return !shouldNotBroadcast
}

/**
 * Broadcasts and persists the cache operation.
 * Handles whether the operation should be broadcasted or persisted.
 */
export const handleSyncing = <OperationName extends CacheOperationsToSyncType>(
  operationName: OperationName,
  args: Parameters<InMemoryCacheSyncedType[typeof operationName]>,
  inMemoryCache: InMemoryCacheSynced,
  config?: Pick<GlobalConfig, 'skipBroadcastFilter' | 'skipPersistFilter'>
) => {
  const shouldBroadcast: boolean = getShouldBroadcast(
    operationName,
    args,
    config
  )
  const shouldPersist: boolean = getShouldPersist(operationName, args, config)
  if (shouldBroadcast) broadcast(operationName, args)
  if (shouldPersist) persistInMemoryCache(inMemoryCache)
}

/**
 * @returns whether the client state should be persisted or not
 *   as part of the cache operation.
 */
export const getShouldPersist = <
  OperationName extends CacheOperationsToSyncType,
>(
  operationName: OperationName,
  args: Parameters<InMemoryCacheSyncedType[OperationName]>,
  config?: Pick<GlobalConfig, 'skipPersistFilter'>
): boolean => {
  const shouldNotPersist: boolean =
    config?.skipPersistFilter?.(operationName, args) ||
    (typeof args[0] !== 'string' && Boolean(args[0]?.[shouldNotPersistSymbol]))
  return !shouldNotPersist
}

/**
 * Sets up the broadcastors which broadcast the arguments of operation function call.
 * it modifies the cache operation function definitions by wrapping them with broadcast function.
 */
const setupOperationBroadcastor = (
  inMemoryStore: InMemoryCache,
  operationName: Exclude<CacheOperationsToSyncType, 'reset'>,
  config?: Pick<
    GlobalConfig,
    | 'shouldBroadcastSubscriptionWrites'
    | 'skipBroadcastFilter'
    | 'skipPersistFilter'
  >
) => {
  const originalFn = inMemoryStore[operationName]
  inMemoryStore[operationName] = (
    ...args: Parameters<InMemoryCacheSyncedType[typeof operationName]>
  ) => {
    const shouldPersist: boolean = getShouldPersist(operationName, args, config)

    /** The arguments to broadcast. It could be different from the args applied here. */
    const argsToBroadcast: typeof args = [...args]
    if (
      (operationName === 'retain' || operationName === 'release') &&
      typeof args[0] !== 'string'
    ) {
      const firstArg = args[0] as Exclude<
        Parameters<InMemoryCacheSyncedType['retain']>[0],
        string
      >
      args[0] = firstArg?.value
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (originalFn as any).apply(inMemoryStore, args)

    if (!config?.shouldBroadcastSubscriptionWrites) {
      /**
       * Skipping broadcasting of writes caused by graphql subscriptions.
       * @see {@link GlobalConfig.shouldBroadcastSubscriptionWrites}
       */
      if (operationName === 'write') {
        if (
          (args as Parameters<InMemoryCacheSyncedType['write']>)[0]?.dataId ===
          'ROOT_SUBSCRIPTION'
        ) {
          if (shouldPersist) persistInMemoryCache(inMemoryStore)
          return
        }
      }
    }

    const shouldBroadcast: boolean = getShouldBroadcast(
      operationName,
      argsToBroadcast,
      config
    )
    if (shouldBroadcast) broadcast(operationName, argsToBroadcast)
    if (shouldPersist) persistInMemoryCache(inMemoryStore)
    return result
  }
}

/**
 * reset operation requires async version of the {@link setupOperationBroadcastor}.
 */
const setupBroadcastorForResets = (
  inMemoryStore: InMemoryCache,
  config?: Pick<
    GlobalConfig,
    | 'shouldBroadcastSubscriptionWrites'
    | 'skipBroadcastFilter'
    | 'skipPersistFilter'
  >
) => {
  const originalFn = inMemoryStore['reset']
  inMemoryStore['reset'] = async (...args) => {
    await originalFn.apply(inMemoryStore, [])
    const shouldBroadcast: boolean = getShouldBroadcast('reset', args, config)
    const shouldPersist: boolean = getShouldPersist('reset', args, config)
    if (shouldBroadcast) broadcast('reset', args)
    if (shouldPersist) persistInMemoryCache(inMemoryStore)
  }
}

/**
 * Sets up broadcastors of apollo cache's state across browsing contexts.
 * Modifying the operations of the cache.
 * Adding logic to broadcast changes made in each operation.
 *  Broadcasting the arguments of operation function call.
 *  The arguments will be used by the listeners to replicate the function call in other browsing contexts.
 */
export const setupBroadcastors = (
  inMemoryStore: InMemoryCacheSyncedType,
  config?: Pick<
    GlobalConfig,
    | 'shouldBroadcastSubscriptionWrites'
    | 'skipBroadcastFilter'
    | 'skipPersistFilter'
  >
) => {
  for (const operationName of cacheOperationsToSync) {
    if (operationName === 'reset') {
      setupBroadcastorForResets(inMemoryStore, config)
      continue
    }
    setupOperationBroadcastor(inMemoryStore, operationName, config)
  }
}
