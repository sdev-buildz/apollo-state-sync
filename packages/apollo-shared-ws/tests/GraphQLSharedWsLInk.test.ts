vi.mock('graphql-shared-ws', () => {
  return {
    createSharedClient: vi.fn(
      (...args: Parameters<typeof mockCreateSharedClient>) =>
        mockCreateSharedClient(...args)
    ),
  }
})
import { ApolloClient, ApolloLink, gql, InMemoryCache } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import {
  clientHandles,
  mockCreateSharedClient,
  type ClientHandle,
} from '@packages/common-utils/mocks'
import type { ClientResolver } from '@src/ClientResolver'
import { print } from 'graphql'
import { createSharedClient, type SharedClient } from 'graphql-shared-ws'
import type { SubscribePayload } from 'graphql-ws'
import { expect, it, vi } from 'vitest'
import { setupRestartSubscription } from '../src/setupRestartSubscription'

const subscribePayload: SubscribePayload = {
  query: print(gql`
    subscription test1 {
      test
    }
  `),
  variables: {},
  extensions: {},
  operationName: 'test1',
}

const newMockSink = () => ({
  next: vi.fn(),
  error: vi.fn(),
  complete: vi.fn(),
})
const mockSink = newMockSink()

const getNewApolloClient = (): {
  apolloClient: ApolloClient
  clientHandle: ClientHandle
  link: GraphQLWsLink
  gqlClient: SharedClient
} => {
  const gqlClient = createSharedClient({
    url: 'wss://localhost:3000/subscriptions',
  })
  const link = new GraphQLWsLink(gqlClient)
  const newClient = new ApolloClient({
    link,
    cache: new InMemoryCache(),
  })
  const clientHandle = clientHandles[clientHandles.length - 1]
  if (!clientHandle) throw new Error('clientHandles is empty')
  return {
    apolloClient: setupRestartSubscription(newClient, {
      sharedClient: gqlClient,
    }),
    clientHandle,
    link,
    gqlClient,
  }
}

it('restarts subscriptions.', () => {
  const { apolloClient, clientHandle } = getNewApolloClient()

  const observable = apolloClient.subscribe({
    query: gql(subscribePayload.query),
  })

  observable.subscribe(mockSink)
  observable.restart()

  expect(clientHandle.restartSubscription).toHaveBeenCalledTimes(1)
})

it('restarts subscription of only the corresponding ApolloLink when using ApolloLink.split.', () => {
  const client1 = getNewApolloClient()
  const client2 = getNewApolloClient()

  const splitLink = ApolloLink.split(
    ({ operationName }) =>
      Boolean(operationName?.toLowerCase()?.includes('useLink2'.toLowerCase())),
    client1.link,
    client2.link
  )
  const sharedClientResolver: ClientResolver = ({ operationName }) => {
    if (operationName?.toLowerCase()?.includes('useLink2'.toLowerCase()))
      return client2.gqlClient
    return client1.gqlClient
  }
  const apolloClient = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
  })
  setupRestartSubscription(apolloClient, {
    sharedClientResolver,
  })

  const observable1 = apolloClient.subscribe({
    query: gql(subscribePayload.query),
  })
  const observable2 = apolloClient.subscribe({
    query: gql(subscribePayload.query),
  })
  const sink1 = newMockSink()
  const sink2 = newMockSink()
  observable1.subscribe(sink1)
  observable2.subscribe(sink2)

  expect(client1.clientHandle.restartSubscription).not.toHaveBeenCalled()
  expect(client2.clientHandle.restartSubscription).not.toHaveBeenCalled()

  client1.clientHandle.restartSubscription?.(subscribePayload)
  expect(client1.clientHandle.restartSubscription).toHaveBeenCalledTimes(1)
  expect(client2.clientHandle.restartSubscription).not.toHaveBeenCalled()

  client2.clientHandle.restartSubscription?.(subscribePayload)
  expect(client1.clientHandle.restartSubscription).toHaveBeenCalledTimes(1)
  expect(client2.clientHandle.restartSubscription).toHaveBeenCalledTimes(1)
})
