import serializeJavascript from 'serialize-javascript'

type Listener = (event: Event) => void

/**
 * Mock implementation of the BroadcastChannel API
 */
export class MockBroadcastChannel implements globalThis.BroadcastChannel {
  static instances: MockBroadcastChannel[] = []

  name: string
  private listeners: Array<Listener> = []

  constructor(name: string) {
    this.name = name
    MockBroadcastChannel.instances.push(this)
  }

  addEventListener(
    _: Parameters<globalThis.BroadcastChannel['addEventListener']>[0],
    listener: Listener
  ) {
    this.listeners.push(listener)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  postMessage(msg: any) {}

  /**
   *  Test helper: simulate an incoming message event from another context
   */
  emitMessage(data: unknown) {
    const ev = {
      data: serializeJavascript(data),
    } as MessageEvent
    this.listeners.forEach((l) => l(ev))
  }

  onmessage = null
  onmessageerror = null
  close(): void {}
  removeEventListener(): void {}
  dispatchEvent = () => false

  /**
   * Test helper: get the last created instance
   */
  public static getBroadcastChannel() {
    return MockBroadcastChannel.instances[
      MockBroadcastChannel.instances.length - 1
    ]!
  }
}

globalThis.BroadcastChannel = MockBroadcastChannel
