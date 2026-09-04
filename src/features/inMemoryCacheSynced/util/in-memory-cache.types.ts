import type { ApolloClient } from '@apollo/client'
import type { InMemoryCacheSyncedType } from './InMemoryCacheSyncedType'

/**
 * Names of cache operations to broadcast.
 */
export type CacheOperationsToSyncType = keyof Pick<
  InMemoryCacheSyncedType,
  'write' | 'evict' | 'modify' | 'gc' | 'reset' | 'retain' | 'release'
>

/** Array of names of every cache operation to broadcast. */
export const cacheOperationsToSync = [
  'write',
  'evict',
  'modify',
  'gc',
  'reset',
  'retain',
  'release',
] as const satisfies CacheOperationsToSyncType[]

/**
 * Type safety check to make sure that all the operations in the {@link CacheOperationsToSyncType}
 *  literal union type are included in the {@link cacheOperationsToSync} array.
 * @see Reference_StackOverflow_Answer - {@link https://stackoverflow.com/a/60132060}
 */
const allOperationsSyncedTypeSafety = <T extends CacheOperationsToSyncType[]>(
  array: T & ([CacheOperationsToSyncType] extends [T[number]] ? unknown : never)
) => array
allOperationsSyncedTypeSafety(cacheOperationsToSync)

/**
 * Wrapper around string to use as object.
 */
export type WrappedString = {
  value: string
}

/**
 * The broadcasted info about the cache operation.
 * It contains the operation name and the arguments for the operation function call.
 * @param Broadcasted - Whether the message is already broadcasted or not.
 */
export type CacheSyncMessageType<
  OperationName extends CacheOperationsToSyncType = CacheOperationsToSyncType,
> = {
  operationName: OperationName
  args: Parameters<InMemoryCacheSyncedType[OperationName]>
}

/** Maps the operation names to the corresponding broadcasted messages. */
export type CacheSyncMessageTypeMap = {
  [
    OperationName in CacheOperationsToSyncType
  ]: CacheSyncMessageType<OperationName>
}

/**
 * Used to specify if the cache operation should not be broadcasted.
 * Operation will not be broadcasted if it is set to true as shown in this following example.
 * @example
 * ```ts
 * const inMemoryStore = new InMemoryCacheSynced(inMemoryCacheConfig)
 *
 * inMemoryStore.write({
 *  //  Since this is true, this operations will not be broadcasted.
 *  [shouldNotBroadcastSymbol]: true,
 *  query: gql('query { currentUser: { id } }'),
 *  result: {
 *    currentUser: { id : 2 }
 *  }
 * })
 * ```
 */
export const shouldNotBroadcastSymbol = Symbol('shouldNotBroadcast')

/**
 * By default, {@link ApolloClient}'s state is persisted following every cache operation.
 *
 * This symbol is used to specify if the apollo client's state should not be persisted following a specific operation.
 * Apollo Client's state will not be persisted if it is set to true as shown in this following example.
 * @example
 * ```ts
 * const inMemoryStore = new InMemoryCacheSynced(inMemoryCacheConfig)
 *
 * inMemoryStore.write({
 *  //  Since this is true, the cache will not be persisted as part of this cache operation.
 *  [shouldNotPersistSymbol]: true,
 *  query: gql('query { currentUser: { id } }'),
 *  result: {
 *    currentUser: { id : 2 }
 *  }
 * })
 * ```
 */
export const shouldNotPersistSymbol = Symbol('shouldNotPersist')

/**
 * Used to augment the parameters of cache operations.
 */
export type CacheSyncOptionsAugmentType = {
  [shouldNotBroadcastSymbol]?: boolean
  [shouldNotPersistSymbol]?: boolean
}
