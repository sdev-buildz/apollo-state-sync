import type { ApolloClient } from '@apollo/client'
import type { InMemoryCacheSyncedType } from './InMemoryCacheSyncedType'

/**
 * Cache operations which are to be broadcasted across browsing contexts.
 */
export type CacheOperationsToSyncType = keyof Pick<
  InMemoryCacheSyncedType,
  'write' | 'evict' | 'modify' | 'gc' | 'reset' | 'retain' | 'release'
>

/** Cache operations which are to be broadcasted across browsing contexts. */
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
 * Wrapper around string to behave like objects.
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
 * Used to specify if the operation should not be broadcasted to other browsing contexts.
 * Operation will not be broadcasted if it is set to true as shown in this following example.
 * @example
 * ```ts
 * const inMemoryStore = setupStateSyncer(new InMemoryCache(inMemoryCacheConfig)
 *
 * inMemoryStore.write({
 *  //  Since this is true, this operations will not be broadcasted to other browsing contexts.
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
 * This synbol is used to specify if the apollo client's state should not be persisted following a specific operation.
 * Apollo Client's state will not be persisted if it is set to true as shown in this following example.
 * @example
 * ```ts
 * const inMemoryStore = setupStateSyncer(new InMemoryCache(inMemoryCacheConfig)
 *
 * inMemoryStore.write({
 *  //  Since this is true, this operations will not be broadcasted to other browsing contexts.
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
 * Used to augment the options parameter of cache operations.
 */
export interface CacheSyncOptionsAugmentType {
  /**
   * If true, this is a broadcasted message, and so should not be rebroadcasted again.
   */
  [shouldNotBroadcastSymbol]?: boolean
  [shouldNotPersistSymbol]?: boolean
}
