import type { CacheOperationsToSyncType } from '@features/inMemoryCacheSynced/util/in-memory-cache.types'
import type { InMemoryCacheSyncedType } from '@features/inMemoryCacheSynced/util/InMemoryCacheSyncedType'
import type { SynchronizationDebouncer } from './util/synchronizationDebouncer'

/**
 * Filters cache operations that should be skipped by a synchronization step.
 *
 * Return `true` when the operation should be ignored for that specific phase
 * (for example, when broadcasting to other browsing contexts, persisting to
 * storage, or applying incoming synchronized writes).
 * @param operationName - The cache operation being evaluated.
 * @param operationArgs - The arguments passed to that cache operation.
 * @returns `true` to skip the operation, otherwise `false`.
 */
export type ShouldSkipFilter = (
  operationName: CacheOperationsToSyncType,
  operationArgs: Parameters<InMemoryCacheSyncedType[CacheOperationsToSyncType]>
) => boolean

/**
 * Configuration options for synchronizing cache operations across different browsing contexts (e.g., tabs, windows).
 */
export type CacheSyncerConfigType = {
  /**
   * Determines whether cache operations triggered by GraphQL subscriptions should be broadcast for synchronization.
   * @remarks
   * By default, this is `false` because WebSocket connections typically notify other browsing contexts
   * directly about subscription updates.
   *
   * **Warning:** Setting this to `true` can cause infinite back-and-forth broadcasts loops between browsing contexts.
   * To prevent this, define a custom filter using {@link CacheSyncerConfigType.skipBroadcastFilter} and {@link CacheSyncerConfigType.skipPersistFilter}.
   * @default false
   * @see {@link https://www.npmjs.com/package/apollo-shared-ws | apollo-shared-ws} for deduplicating GraphQL subscription channels across browsing contexts.
   * @see {@link File://assets/reactive-vars-and-sub-writes.png | Architecture Diagram} for why reactive variables updated by subscriptions are broadcast
   *    only while the debounce timer runs.
   */
  shouldBroadcastSubscriptionWrites?: boolean

  /**
   * Callback to prevent specific operations from being broadcast to other browsing contexts.
   * @return `true` if the operation should **not** be broadcast; otherwise, `false`.
   */
  skipBroadcastFilter?: ShouldSkipFilter

  /**
   * Callback to prevent specific cache operations from being persisted to local storage.
   * @return `true` if the operation should **not** be persisted; otherwise, `false`.
   */
  skipPersistFilter?: ShouldSkipFilter

  /**
   * Callback to ignore incoming operations broadcast by other browsing contexts.
   * @return `true` if the incoming operation should be ignored and dropped; otherwise, `false`.
   */
  skipListenedFilter?: ShouldSkipFilter
}

/**
 * Global configuration options for the `Apollo State Sync` library.
 */
export type GlobalConfig = {
  /**
   * The number of milliseconds to debounce synchronization broadcasts.
   * @see {@link SynchronizationDebouncer}
   */
  synchronizationDebounceTimeoutMs: number

  /**
   * @deprecated Use `synchronizationDebounceTimeoutMs` instead.
   */
  synhnorizationDebounceTimeoutMs: number

  /**
   * The time in milliseconds after which the persisted cache expires.
   * Set to `0` to completely disable persistence.
   */
  persistedCacheExpiryMilliseconds: number
} & CacheSyncerConfigType

/**
 * Global configuration options for the `Apollo State Sync` library.
 */
export const globalConfig: GlobalConfig = {
  /**
   * Caclulation of this default value:
   *
   *  Typically React's rerendering time should be within 16ms.
   *
   *  Syncing process of reactive variables takes more time than that of in-memory cache operations.
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
