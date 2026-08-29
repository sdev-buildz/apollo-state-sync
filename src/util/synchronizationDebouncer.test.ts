import { beforeEach, describe, expect, test, vi } from 'vitest'
import { globalConfig } from '../globalConfig'
import { synchronizationDebouncer } from './synchronizationDebouncer'

vi.mock('../globalConfig', () => {
  return {
    globalConfig: {
      synhnorizationDebounceTimeoutMs: 24,
    },
  }
})

vi.useFakeTimers()

describe('synchronizationDebouncer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('debounced functions should get executed when timeout expires', () => {
    const debouncedFunSpy = vi.fn()
    synchronizationDebouncer.debounce(debouncedFunSpy)
    vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs - 1)
    expect(debouncedFunSpy).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(debouncedFunSpy).toHaveBeenCalledTimes(1)
  })

  test(`Debounce time should be configurable from the global configuration object.`, async () => {
    vi.doMock('../globalConfig', () => {
      return {
        globalConfig: {
          synhnorizationDebounceTimeoutMs: 34,
        },
      }
    })
    const { synchronizationDebouncer: syncDebouncer2 } =
      await import('./synchronizationDebouncer')
    const debouncedFunSpy = vi.fn()
    syncDebouncer2.debounce(debouncedFunSpy)
    vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs - 1)
    expect(debouncedFunSpy).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(debouncedFunSpy).toHaveBeenCalledTimes(1)
  })

  test('Whenever new callbacks are debounced, the debounce timer should be reset.', () => {
    const cbSpy = vi.fn()
    const cb2Spy = vi.fn()
    const cb3Spy = vi.fn()

    synchronizationDebouncer.debounce(cbSpy)

    vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs - 2)
    expect(cbSpy).not.toHaveBeenCalled()

    synchronizationDebouncer.debounce(cb2Spy)
    vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs - 1)
    expect(cbSpy).not.toHaveBeenCalled()
    expect(cb2Spy).not.toHaveBeenCalled()

    synchronizationDebouncer.debounce(cb3Spy)
    vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs - 1)
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
    vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs - 1)
    expect(cbSpy).not.toHaveBeenCalled()

    synchronizationDebouncer.graphqlRequestStarted()

    vi.advanceTimersByTime(2 * globalConfig.synhnorizationDebounceTimeoutMs)
    expect(cbSpy).not.toHaveBeenCalled()

    synchronizationDebouncer.graphqlRequestCompleted()

    vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs)
    expect(cbSpy).toHaveBeenCalledTimes(1)
  })

  test(`When one or more graphql requests are made, the debounce timer should be paused and should be reset only once all the corresponding reponses are received`, () => {
    const cbSpy = vi.fn()
    synchronizationDebouncer.debounce(cbSpy)
    vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs - 1)
    expect(cbSpy).not.toHaveBeenCalled()

    //  First GraphQL request is started. It is currently in-flight.
    synchronizationDebouncer.graphqlRequestStarted()

    vi.advanceTimersByTime(2 * globalConfig.synhnorizationDebounceTimeoutMs)
    expect(cbSpy).not.toHaveBeenCalled()

    //  Second GraphQL request is started. It is currently in-flight.
    synchronizationDebouncer.graphqlRequestStarted()

    vi.advanceTimersByTime(2 * globalConfig.synhnorizationDebounceTimeoutMs)
    expect(cbSpy).not.toHaveBeenCalled()

    //  First GraphQL request is completed. It is not in-flight anymore.
    synchronizationDebouncer.graphqlRequestCompleted()

    //  Since the response of the second GraphQL request is not yet received, the debounce timer should not be reset.
    vi.advanceTimersByTime(2 * globalConfig.synhnorizationDebounceTimeoutMs)
    expect(cbSpy).not.toHaveBeenCalled()

    //  Third and fourth GraphQL requests are started. They are currently 3 requests in-flight.
    synchronizationDebouncer.graphqlRequestStarted()
    synchronizationDebouncer.graphqlRequestStarted()

    vi.advanceTimersByTime(2 * globalConfig.synhnorizationDebounceTimeoutMs)
    expect(cbSpy).not.toHaveBeenCalled()

    //  2 requests are compoleted. There is still 1 request in-flight.
    synchronizationDebouncer.graphqlRequestCompleted()
    synchronizationDebouncer.graphqlRequestCompleted()

    vi.advanceTimersByTime(2 * globalConfig.synhnorizationDebounceTimeoutMs)
    expect(cbSpy).not.toHaveBeenCalled()

    //  The last GraphQL request is completed. The debounce timer should be reset.
    synchronizationDebouncer.graphqlRequestCompleted()

    vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs)
    expect(cbSpy).toHaveBeenCalledTimes(1)
  })
})
