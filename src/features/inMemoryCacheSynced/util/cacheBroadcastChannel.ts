import { SerializingBroadcastChannel } from '../../../lib/SerializingBroadcastChannel'
import type { TypedBroadcastChannel } from '../../../lib/TypedBroadcastChannel'
import { type CacheSyncMessageType } from './in-memory-cache.types'
/**
 * Wrapper around the {@link BroadcastChannel} API.
 * Exposes APIs to broadcast and listen to the cache state changes.
 */
type CacheBroadcastChannelType = TypedBroadcastChannel<
  CacheSyncMessageType,
  'apollo-cache-state'
>

/** {@inheritDoc CacheSyncTypedBroadcastChannel} {@link CacheBroadcastChannelType} */
class CacheBroadcastChannel
  extends SerializingBroadcastChannel
  implements CacheBroadcastChannelType
{
  declare name: CacheBroadcastChannelType['name']
  constructor(name: CacheBroadcastChannelType['name']) {
    super(name)
  }

  /**
   * Sets up a serializer which serializes the messages to be broadcasted.
   * It helps in serializing non-serializable elements such as functions, dates, etc.
   */
  override postMessage: CacheBroadcastChannelType['postMessage'] = (
    message
  ): void => {
    super.postMessage(message)
  }

  /** Sets up a debouncer on the broadcasted cache operations. */
  override addEventListener: CacheBroadcastChannelType['addEventListener'] = ((
    type: Parameters<CacheBroadcastChannelType['addEventListener']>[0],
    listener: Parameters<CacheBroadcastChannelType['addEventListener']>[1],
    options: Parameters<CacheBroadcastChannelType['addEventListener']>[2]
  ) => {
    super.addEventListener(
      type,
      (event) => {
        const eventData = event.data
        const data: MessageEvent<CacheSyncMessageType>['data'] =
          eventData as typeof data
        if ('handleEvent' in listener) listener.handleEvent({ ...event, data })
        else listener({ ...event, data })
      },
      options
    )
  }) as CacheBroadcastChannelType['addEventListener']
}

/** {@inheritDoc CacheSyncBroadcastChannel} {@link CacheBroadcastChannel} */
export const cacheBroadcastChannel: CacheBroadcastChannel =
  new CacheBroadcastChannel(
    'apollo-cache-state' satisfies CacheBroadcastChannel['name']
  )
