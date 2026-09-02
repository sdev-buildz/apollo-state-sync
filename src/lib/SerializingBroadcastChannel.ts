import { canonicalSerialization, deserialize } from 'canonical-serialization'

/**
 * A BroadcastChannel that serializes the messages using {@link canonicalSerialization}.
 */
export class SerializingBroadcastChannel extends BroadcastChannel {
  public override postMessage(message: unknown): void {
    super.postMessage(canonicalSerialization(message))
  }

  public override addEventListener<K extends keyof BroadcastChannelEventMap>(
    type: K,
    listener: (event: BroadcastChannelEventMap[K]) => void,
    options?: Parameters<BroadcastChannel['addEventListener']>[2]
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

        listener({ ...event, data })
      },
      options
    )
  }
}
