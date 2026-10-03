# InMemoryCacheSynced

## Constructure Signature

```ts
  constructor(
    config?: ConstructorParameters<typeof InMemoryCache>[0],
    protected readonly stateSyncerConfig?: CacheSyncerConfigType
  ) {
  }
```

## CacheSyncerConfigType

```ts
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
```
