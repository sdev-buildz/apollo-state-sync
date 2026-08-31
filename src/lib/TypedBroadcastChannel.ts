/**
 * Wrapper around the {@link BroadcastChannel} API.
 * Enables adding types to broadcasted messages and channel name.
 */
export class TypedBroadcastChannel<
  MessageType,
  ChannelNameType extends string = string,
> extends BroadcastChannel {
  constructor(override readonly name: ChannelNameType) {
    super(name)
  }

  override postMessage(message: MessageType) {
    super.postMessage(message)
  }

  override onmessage: ((event: MessageEvent<MessageType>) => void) | null = null

  override addEventListener<K extends keyof BroadcastChannelEventMap>(
    type: K,
    listener:
      | {
          (
            event: K extends 'message'
              ? MessageEvent<MessageType>
              : MessageEvent
          ): void
        }
      | {
          handleEvent(
            object: K extends 'message'
              ? MessageEvent<MessageType>
              : MessageEvent
          ): void
        },
    options?: boolean | AddEventListenerOptions
  ): void {
    super.addEventListener(type, listener as EventListenerObject, options)
  }
}
