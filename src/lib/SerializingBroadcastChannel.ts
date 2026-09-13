import { canonicalSerialization, deserialize } from 'canonical-serialization'
import type { TypedBroadcastChannel } from './TypedBroadcastChannel'

type SerializingBcType = TypedBroadcastChannel<unknown>

/**
 * A BroadcastChannel that serializes the messages using {@link canonicalSerialization}.
 */
export class SerializingBroadcastChannel
  extends BroadcastChannel
  implements SerializingBcType
{
  public override postMessage(message: unknown): void {
    super.postMessage(canonicalSerialization(message))
  }

  public override addEventListener(
    type: Parameters<SerializingBcType['addEventListener']>[0],
    listener: Parameters<SerializingBcType['addEventListener']>[1],
    options?: Parameters<SerializingBcType['addEventListener']>[2]
  ): void {
    super.addEventListener(
      type,
      (event) => {
        const eventData = event.data
        let data: unknown
        /**
         * This condition would be false only during unit testing.
         *  Because serializing and deserializing functions causes test matchers
         *    to provide false nagatives, when the compared functions are the same.
         */
        if (typeof eventData === 'string') data = deserialize(`(${eventData})`)
        else data = eventData

        if ('handleEvent' in listener) listener.handleEvent({ ...event, data })
        else listener({ ...event, data })
      },
      options
    )
  }
}
