import type { CacheOperationsToSyncType } from '@features/inMemoryCacheSynced/util/in-memory-cache.types'
import type { InMemoryCacheSyncedType } from '@features/inMemoryCacheSynced/util/InMemoryCacheSyncedType'
import type { SynchronizationDebouncer } from './util/synchronizationDebouncer'

/**
 * @return true, if the operation should not be broadcast, false otherwise.
 */
export type ShouldSkipFilter = (
  operationName: CacheOperationsToSyncType,
  args: Parameters<InMemoryCacheSyncedType[CacheOperationsToSyncType]>
) => boolean

/**
 * The configuration options for cache syncer.
 */
export type CacheSyncerConfigType = {
  /**
   * Set to true, if the cache writes caused by graphql subscription operations
   *   are to be broadcast for syncing.
   *
   * Since graphql subscriptions are handled by {@link https://www.npmjs.com/package/apollo-shared-ws | apollo-shared-ws} WebSocket connections,
   *    other browsing contexts also get notified of the subscription writes directly by the WebSocket connections itself.
   *  So subscription writes are not broadcast by default.
   *
   *  Setting this to true could cause indefinite back-and-forth broadcasting between browsing contexts.
   *   To avoid that, provide a value for {@link GlobalConfig.skipBroadcastFilter}.
   * @see [Diagram](assets/reactive-vars-and-sub-writes.png) - for detailed explanation on why reactive variables are broadcast only when the debounce timer is running.
   * @default false.
   */
  shouldBroadcastSubscriptionWrites?: boolean

  /**
   * @return true, if the operation is not to be broadcast.
   */
  skipBroadcastFilter?: ShouldSkipFilter

  /**
   * @return true, if the operation is not to be persisted.
   */
  skipPersistFilter?: ShouldSkipFilter

  /**
   * @return true, if the listened operation (which is broadcast from a
   *   different browsing context) is to be ignored and should not be processed.
   */
  skipListenedFilter?: ShouldSkipFilter
}

/**
 * The configuration options
 */
export type GlobalConfig = {
  /**
   * The number of milliseconds to debounce the synchronization broadcasts.
   * @see {@link SynchronizationDebouncer}
   */
  synchronizationDebounceTimeoutMs: number

  /**
   * @deprecated Use `synchronizationDebounceTimeoutMs` instead.
   */
  synhnorizationDebounceTimeoutMs: number

  /**
   * The time in milliseconds after which the persisted cache expires.
   * Set to 0 to disable persistance.
   */
  persistedCacheExpiryMilliseconds: number
} & CacheSyncerConfigType

/**
 * The global configuration.
 */
export const globalConfig: GlobalConfig = {
  /**
   * Caclulation of this default value:
   *
   *  Typically React's rerendering time should be within 16ms.
   *
   *  Syncing process of reactive variables take more time than that of in-memory cache operations.
   *  When reactive variable changes are broadcast, they are rebroadcast back from the listening browsing contexts.
   *    The rebroadcast events are ignored and are not rebroadcast again.
   *    This process took 21ms most of the times during my experiments.
   *    So the default debouncing time is set at 24ms.
   */
  synchronizationDebounceTimeoutMs: 24,
  persistedCacheExpiryMilliseconds: 2 * 60 * 60 * 1000,
  shouldBroadcastSubscriptionWrites: false,
} as GlobalConfig

Object.defineProperty(globalConfig, 'synhnorizationDebounceTimeoutMs', {
  get() {
    return this.synchronizationDebounceTimeoutMs
  },
  set(value: number) {
    this.synchronizationDebounceTimeoutMs = value
  },
  enumerable: true,
  configurable: true,
})
