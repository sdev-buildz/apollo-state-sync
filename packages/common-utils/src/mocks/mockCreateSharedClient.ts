import type { createSharedClient } from 'graphql-shared-ws'
import type { Sink, SubscribePayload } from 'graphql-ws'
import { vi, type Mock } from 'vitest'

/**
 * To track and control the mock shared client during testing.
 */
export type ClientHandle = {
  subscribe: Mock
  restartSubscription: ReturnType<
    typeof createSharedClient
  >['restartSubscription']
  subscriptions: Array<{
    payload: SubscribePayload
    sink: Sink
    unsubscribe: Mock
  }>
}

/**
 * Array of all the {@link ClientHandle | client handles}.
 */
export const clientHandles: ClientHandle[] = []

/**
 * Mock for {@link createSharedClient}.
 */
export const mockCreateSharedClient: (
  ...args: Parameters<typeof createSharedClient>
) => Pick<
  ReturnType<typeof createSharedClient>,
  'subscribe' | 'restartSubscription'
> = vi.fn((graphqlWsClientOptions) => {
  const subscriptions: ClientHandle['subscriptions'] = []
  const subscribe = vi.fn((payload: SubscribePayload, sink: Sink) => {
    const unsubscribeMock = vi.fn()
    subscriptions.push({
      payload,
      sink,
      unsubscribe: unsubscribeMock,
    })
    return unsubscribeMock
  })
  const restartSubscription: ReturnType<
    typeof createSharedClient
  >['restartSubscription'] = vi.fn(() => () => {})
  clientHandles.push({
    subscribe: subscribe,
    restartSubscription,
    subscriptions,
  })
  return {
    subscribe,
    restartSubscription,
  }
})
