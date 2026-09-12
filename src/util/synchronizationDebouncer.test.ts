import type { ApolloLink } from '@apollo/client'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { globalConfig } from '../globalConfig'
import { synchronizationDebouncer } from './synchronizationDebouncer'

vi.useFakeTimers()

describe('synchronizationDebouncer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('debounced functions should get executed when timeout expires', () => {
    const debouncedFunSpy = vi.fn()
    synchronizationDebouncer.debounce(debouncedFunSpy)
    vi.advanceTimersByTime(globalConfig.synchronizationDebounceTimeoutMs - 1)
    expect(debouncedFunSpy).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(debouncedFunSpy).toHaveBeenCalledTimes(1)
  })

  test(`Debounce time should be configurable from the global configuration object.`, async () => {
    vi.doMock('../globalConfig', () => {
      return {
        globalConfig: {
          synchronizationDebounceTimeoutMs: 34,
        },
      }
    })
    const { synchronizationDebouncer: syncDebouncer2 } =
      await import('./synchronizationDebouncer')
    const debouncedFunSpy = vi.fn()
    syncDebouncer2.debounce(debouncedFunSpy)
    vi.advanceTimersByTime(globalConfig.synchronizationDebounceTimeoutMs - 1)
    expect(debouncedFunSpy).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(debouncedFunSpy).toHaveBeenCalledTimes(1)
  })

  test('Whenever new callbacks are debounced, the debounce timer should be reset.', () => {
    const cbSpy = vi.fn()
    const cb2Spy = vi.fn()
    const cb3Spy = vi.fn()

    synchronizationDebouncer.debounce(cbSpy)

    vi.advanceTimersByTime(globalConfig.synchronizationDebounceTimeoutMs - 2)
    expect(cbSpy).not.toHaveBeenCalled()

    synchronizationDebouncer.debounce(cb2Spy)
    vi.advanceTimersByTime(globalConfig.synchronizationDebounceTimeoutMs - 1)
    expect(cbSpy).not.toHaveBeenCalled()
    expect(cb2Spy).not.toHaveBeenCalled()

    synchronizationDebouncer.debounce(cb3Spy)
    vi.advanceTimersByTime(globalConfig.synchronizationDebounceTimeoutMs - 1)
    expect(cbSpy).not.toHaveBeenCalled()
    expect(cb2Spy).not.toHaveBeenCalled()
    expect(cb3Spy).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(cbSpy).toHaveBeenCalledTimes(1)
    expect(cb2Spy).toHaveBeenCalledTimes(1)
    expect(cb3Spy).toHaveBeenCalledTimes(1)
  })

  test(`Whenever any graphql request is made, the debounce timer should be paused and should be reset only once the corresponding reponse is received`, () => {
    const cbSpy = vi.fn()
    synchronizationDebouncer.debounce(cbSpy)
    vi.advanceTimersByTime(globalConfig.synchronizationDebounceTimeoutMs - 1)
    expect(cbSpy).not.toHaveBeenCalled()

    const operation: ApolloLink.Operation = {} as ApolloLink.Operation

    synchronizationDebouncer.graphqlRequestStarted(operation)

    vi.advanceTimersByTime(2 * globalConfig.synchronizationDebounceTimeoutMs)
    expect(cbSpy).not.toHaveBeenCalled()

    synchronizationDebouncer.graphqlRequestCompleted(operation)

    vi.advanceTimersByTime(globalConfig.synchronizationDebounceTimeoutMs)
    expect(cbSpy).toHaveBeenCalledTimes(1)
  })

  test(`When one or more graphql requests are made, the debounce timer should be paused and should be reset only once all the corresponding reponses are received`, () => {
    const cbSpy = vi.fn()
    synchronizationDebouncer.debounce(cbSpy)
    vi.advanceTimersByTime(globalConfig.synchronizationDebounceTimeoutMs - 1)
    expect(cbSpy).not.toHaveBeenCalled()
    const operation1: ApolloLink.Operation = {} as ApolloLink.Operation
    const operation2: ApolloLink.Operation = {} as ApolloLink.Operation

    //  First GraphQL request is started. It is currently in-flight.
    synchronizationDebouncer.graphqlRequestStarted(operation1)

    vi.advanceTimersByTime(2 * globalConfig.synchronizationDebounceTimeoutMs)
    expect(cbSpy).not.toHaveBeenCalled()

    //  Second GraphQL request is started. It is currently in-flight.
    synchronizationDebouncer.graphqlRequestStarted(operation1)

    vi.advanceTimersByTime(2 * globalConfig.synchronizationDebounceTimeoutMs)
    expect(cbSpy).not.toHaveBeenCalled()

    //  First GraphQL request is completed. It is not in-flight anymore.
    synchronizationDebouncer.graphqlRequestCompleted(operation1)

    //  Since the response of the second GraphQL request is not yet received, the debounce timer should not be reset.
    vi.advanceTimersByTime(2 * globalConfig.synchronizationDebounceTimeoutMs)
    expect(cbSpy).not.toHaveBeenCalled()

    //  Third and fourth GraphQL requests are started. They are currently 3 requests in-flight.
    synchronizationDebouncer.graphqlRequestStarted(operation2)
    synchronizationDebouncer.graphqlRequestStarted(operation2)

    vi.advanceTimersByTime(2 * globalConfig.synchronizationDebounceTimeoutMs)
    expect(cbSpy).not.toHaveBeenCalled()

    //  2 requests are compoleted. There is still 1 request in-flight.
    synchronizationDebouncer.graphqlRequestCompleted(operation2)
    synchronizationDebouncer.graphqlRequestCompleted(operation1)

    vi.advanceTimersByTime(2 * globalConfig.synchronizationDebounceTimeoutMs)
    expect(cbSpy).not.toHaveBeenCalled()

    //  The last GraphQL request is completed. The debounce timer should be reset.
    synchronizationDebouncer.graphqlRequestCompleted(operation2)

    vi.advanceTimersByTime(globalConfig.synchronizationDebounceTimeoutMs)
    expect(cbSpy).toHaveBeenCalledTimes(1)
  })
})
