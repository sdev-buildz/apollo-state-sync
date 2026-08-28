import type { ApolloClient } from '@apollo/client'
import { ApolloLink, execute, gql, Observable } from '@apollo/client'
import { OperationTypeNode, print } from 'graphql'
import type { Sink, SubscribePayload } from 'graphql-ws'
import type { Subscriber } from 'rxjs'
import { type Observer } from 'rxjs'
import { typedObjectEntries } from 'ts-strict-utils'
import { beforeEach, describe, expect, test, vi, type Mock } from 'vitest'
import { synchronizationDebouncer } from '../../util/synchronizationDebouncer'
import { stateSyncLink } from './stateSyncLink'

type OperationName = string
const gqlOperations: Record<
  OperationName,
  {
    observers: Subscriber<unknown>[]
    subscribePayload: SubscribePayload
  }
> = {}
const emitResponse = <ResType = unknown>(
  operationName: OperationName,
  response: ResType,
  cbName: keyof Sink = 'next'
) => {
  const apiObj = controlledServer.gqlOperations[operationName]
  if (!apiObj) throw new Error(`No mock for ${operationName}`)
  apiObj.observers.forEach((observer) => observer[cbName](response))
}

const controlledServer = {
  gqlOperations,
  emitResponse,
}

describe('StateSyncLink', () => {
  const testOperationBase: Omit<
    ApolloLink.Operation,
    'operationName' | 'query'
  > = {
    operationType: OperationTypeNode.QUERY,
    variables: {},
    client: {} as ApolloClient,
    extensions: {},
    getContext: () => ({}),
    setContext: (context) => {},
  }

  const operation1: ApolloLink.Operation = {
    ...testOperationBase,
    operationName: 'testJestQuery1',
    query: gql`
      query testJestQuery1 {
        field1
      }
    `,
  }
  const operation2: ApolloLink.Operation = {
    ...testOperationBase,
    operationName: 'testJestQuery2',
    query: gql`
      query testJestQuery2 {
        field2
      }
    `,
  }
  controlledServer.gqlOperations[operation1.operationName!] = {
    observers: [],
    subscribePayload: {
      query: print(operation1.query),
      operationName: operation1.operationName,
    },
  }
  controlledServer.gqlOperations[operation2.operationName!] = {
    observers: [],
    subscribePayload: {
      query: print(operation2.query),
      operationName: operation2.operationName,
    },
  }

  const sampleRes1 = { data: { field1: 'value1' } }
  const sampleRes2 = { data: { field2: 'value1' } }

  const observerMock: Observer<unknown> = {
    next: vi.fn(),
    error: vi.fn(),
    complete: vi.fn(),
  }

  const syncDebouncerSpy: Record<
    Extract<
      keyof typeof synchronizationDebouncer,
      'graphqlRequestStarted' | 'graphqlRequestCompleted'
    >,
    Mock
  > = {
    graphqlRequestStarted: vi.spyOn(
      synchronizationDebouncer,
      'graphqlRequestStarted'
    ),
    graphqlRequestCompleted: vi.spyOn(
      synchronizationDebouncer,
      'graphqlRequestCompleted'
    ),
  }

  const terminatingLinkHandlerMock: ApolloLink.RequestHandler = vi.fn(
    (operation, forward) => {
      return new Observable((observer) => {
        controlledServer.gqlOperations[operation.operationName]?.observers.push(
          observer
        )
      })
    }
  ) as ApolloLink.RequestHandler
  const terminatingLink = new ApolloLink(terminatingLinkHandlerMock)
  const linkChain = ApolloLink.from([stateSyncLink, terminatingLink])

  beforeEach(() => {
    vi.clearAllMocks()
    for (const [_, apiObj] of typedObjectEntries(
      controlledServer.gqlOperations
    )) {
      apiObj.observers = []
    }
  })

  test(`GraphQL request operations should be forwarded.`, () => {
    execute(linkChain, operation1, {
      client: {} as ApolloClient,
    })
    expect(terminatingLinkHandlerMock).toHaveBeenCalledWith(
      expect.objectContaining({ operationName: operation1.operationName }),
      expect.anything()
    )
    expect(terminatingLinkHandlerMock).toHaveBeenCalledTimes(1)
  })

  test(`GraphQL request operations should be forwarded even if multiple requests are made.`, () => {
    // First request is made
    execute(linkChain, operation1, { client: {} as ApolloClient })
    expect(terminatingLinkHandlerMock).toHaveBeenCalledWith(
      expect.objectContaining({ operationName: operation1.operationName }),
      expect.anything()
    )
    expect(terminatingLinkHandlerMock).toHaveBeenCalledTimes(1)

    expect(terminatingLinkHandlerMock).toHaveBeenCalledTimes(1)

    // Second request is made
    execute(linkChain, operation2, { client: {} as ApolloClient })
    expect(terminatingLinkHandlerMock).toHaveBeenCalledWith(
      expect.objectContaining({ operationName: operation2.operationName }),
      expect.anything()
    )
    expect(terminatingLinkHandlerMock).toHaveBeenCalledTimes(2)
  })

  test('The returned observable should emit the response', () => {
    const obs = execute(linkChain, operation1, { client: {} as ApolloClient })
    obs.subscribe(observerMock)

    expect(observerMock.next).not.toHaveBeenCalled()

    controlledServer.emitResponse(operation1.operationName!, sampleRes1)

    expect(observerMock.next).toHaveBeenCalledWith(sampleRes1)
    expect(observerMock.next).toHaveBeenCalledTimes(1)

    controlledServer.emitResponse(
      operation1.operationName!,
      sampleRes1,
      'complete'
    )
    expect(observerMock.complete).toHaveBeenCalledTimes(1)
  })

  test(`The returned observable should emit all the responses in case of multiple requests.`, () => {
    // First requset is made.
    const obs1 = execute(linkChain, operation1, { client: {} as ApolloClient })
    obs1.subscribe(observerMock)

    // Second requset is made.
    const obs2 = execute(linkChain, operation2, { client: {} as ApolloClient })

    obs2.subscribe(observerMock)

    expect(observerMock.next).not.toHaveBeenCalled()

    controlledServer.emitResponse(operation1.operationName!, sampleRes1)

    // First request's response is received
    expect(observerMock.next).toHaveBeenCalledWith(sampleRes1)
    expect(observerMock.next).toHaveBeenCalledTimes(1)

    controlledServer.emitResponse(operation2.operationName!, sampleRes2)
    // Second request's response is received
    expect(observerMock.next).toHaveBeenCalledWith(sampleRes2)
    expect(observerMock.next).toHaveBeenCalledTimes(2)
  })

  test(`synchronizationDebouncer should be notified whenever requests or responses are received.`, () => {
    const resObs = execute(linkChain, operation1, {
      client: {} as ApolloClient,
    })
    expect(syncDebouncerSpy.graphqlRequestStarted).toHaveBeenCalledTimes(1)
    resObs.subscribe(observerMock)

    expect(syncDebouncerSpy.graphqlRequestCompleted).not.toHaveBeenCalled()

    controlledServer.emitResponse(operation1.operationName!, sampleRes1)
    expect(syncDebouncerSpy.graphqlRequestCompleted).toHaveBeenCalledTimes(1)
  })

  test(`synchronizationDebouncer should not be notified, for GraphQL subscriptions.`, () => {
    const subscriptionRequest: ApolloLink.Operation = {
      ...testOperationBase,
      operationName: 'testSubscriptionQuery',
      query: gql`
        subscription testSubscriptionQuery {
          iterator
        }
      `,
    }
    subscriptionRequest.operationType = OperationTypeNode.SUBSCRIPTION

    const resObs = execute(linkChain, subscriptionRequest, {
      client: {} as ApolloClient,
    })

    expect(terminatingLinkHandlerMock).toHaveBeenCalled()
    resObs.subscribe(observerMock)

    controlledServer.emitResponse(operation1.operationName!, sampleRes1)

    expect(syncDebouncerSpy.graphqlRequestStarted).not.toHaveBeenCalled()
    expect(syncDebouncerSpy.graphqlRequestCompleted).not.toHaveBeenCalled()
  })

  test(`synchronizationDebouncer should be notified even when there are multiple requests or responses.`, () => {
    // First requset is made.
    const resObs1 = execute(linkChain, operation1, {
      client: {} as ApolloClient,
    })
    expect(syncDebouncerSpy.graphqlRequestStarted).toHaveBeenCalledTimes(1)
    resObs1.subscribe(observerMock)

    expect(syncDebouncerSpy.graphqlRequestCompleted).not.toHaveBeenCalled()

    // Second requset is made after 900 ms.
    const resObs2 = execute(linkChain, operation2, {
      client: {} as ApolloClient,
    })

    resObs2.subscribe(observerMock)
    expect(syncDebouncerSpy.graphqlRequestStarted).toHaveBeenCalledTimes(2)

    // First request's response is received
    controlledServer.emitResponse(operation1.operationName!, sampleRes1)

    expect(syncDebouncerSpy.graphqlRequestCompleted).toHaveBeenCalledTimes(1)

    controlledServer.emitResponse(operation2.operationName!, sampleRes2)

    // Second request's response is received
    expect(syncDebouncerSpy.graphqlRequestStarted).toHaveBeenCalledTimes(2)
    expect(syncDebouncerSpy.graphqlRequestCompleted).toHaveBeenCalledTimes(2)
  })
})
