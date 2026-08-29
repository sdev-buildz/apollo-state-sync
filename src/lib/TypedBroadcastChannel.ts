/**
 * Wrapper around the {@link BroadcastChannel} API.
 * Enables adding types to broadcasted messages and channel name.
 */
export type TypedBroadcastChannel<
  MessageType,
  ChannelNameType extends string = string,
> = globalThis.BroadcastChannel & {
  /** The name of the channel. */
  readonly name: ChannelNameType
  /** Broadcasts the message to other BroadcastChannel instances with the same name. */
  postMessage(message: MessageType): void
  /** An event handler called when a message is received. */
  onmessage: ((event: MessageEvent<MessageType>) => void) | null
  /** Attaches an event listener for the "message" event with the specific message type. */
  addEventListener: (
    type: 'message',
    listener: (event: MessageEvent<MessageType>) => void,
    options?: boolean | AddEventListenerOptions
  ) => void
}
