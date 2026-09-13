import { SerializingBroadcastChannel } from '../../../lib/SerializingBroadcastChannel'
import type { TypedBroadcastChannel } from '../../../lib/TypedBroadcastChannel'
import { type CacheSyncMessageType } from './in-memory-cache.types'

type CacheBroadcastChannelType = TypedBroadcastChannel<
  CacheSyncMessageType,
  'apollo-cache-state'
>

/**
 * Wrapper around the {@link BroadcastChannel} API.
 * Exposes APIs to broadcast and listen to the cache state changes.
 */
export const cacheBroadcastChannel: CacheBroadcastChannelType =
  new SerializingBroadcastChannel(
    'apollo-cache-state' satisfies CacheBroadcastChannelType['name']
  ) as CacheBroadcastChannelType
