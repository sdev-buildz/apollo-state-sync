import {
  InMemoryCache,
  type OperationVariables,
  type Reference,
} from '@apollo/client'
import type { Cache } from '@apollo/client/cache'
import type {
  CacheSyncOptionsAugmentType,
  shouldNotBroadcastSymbol,
  WrappedString,
} from './in-memory-cache.types'

/**
 * Typed {@link InMemoryCache} augmented with custom fields.
 * The first parameters of each of the cache operations are augmented
 *  with hidden non-iterable {@link shouldNotBroadcastSymbol} symbol key.
 */
export declare class InMemoryCacheSyncedType extends InMemoryCache {
  override write<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables,
  >(
    options: Cache.WriteOptions<TData, TVariables> & CacheSyncOptionsAugmentType
  ): Reference | undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override modify<Entity extends Record<string, any> = Record<string, any>>(
    options: Cache.ModifyOptions<Entity> & CacheSyncOptionsAugmentType
  ): boolean

  override evict(
    options: Cache.EvictOptions & CacheSyncOptionsAugmentType
  ): boolean

  override reset(
    options?: Cache.ResetOptions & CacheSyncOptionsAugmentType
  ): Promise<void>

  override gc(
    options?: Parameters<InMemoryCache['gc']>[0] & CacheSyncOptionsAugmentType
  ): ReturnType<InMemoryCache['gc']>

  override retain(
    rootId: string | (WrappedString & CacheSyncOptionsAugmentType),
    optimistic?: boolean
  ): number

  override release(
    rootId: string | (WrappedString & CacheSyncOptionsAugmentType),
    optimistic?: boolean
  ): number
}
