import { beforeEach, describe, expect, test, vi } from 'vitest'
import { globalConfig } from '../../globalConfig'
import { MockBroadcastChannel } from '../../lib/MockBroadcastChannel'
import { synchronizationDebouncer } from '../../util/synchronizationDebouncer'
import { ChannelNames, makeVarStateSynced } from './makeVarStateSynced'
import { persistReactiveVar } from './util/persistance'
import type {
  RVarStateSyncConfigType,
  SetReactiveVarOptionsType,
} from './util/types'

vi.useFakeTimers()

type ShouldBroadcastTestParamType = {
  testName: string
  config?: RVarStateSyncConfigType
  updateOptions?: SetReactiveVarOptionsType
  expectToBeBroadcasted: boolean
  expectToBePersisted: boolean
  testVarInitialValue?: unknown
  testVarNewValue?: unknown
}

function resetChannelNames() {
  ChannelNames.names = new Set()
  ChannelNames.namesMap = new WeakMap()
}

const localStorageSetSpy = vi.spyOn(Storage.prototype, 'setItem')

beforeEach((c) => {
  localStorage.clear()
  resetChannelNames()
})

const testVarData = {
  name: 'testVar',
  value: 2,
}

test('restores persisted reactive variables during initialization', () => {
  persistReactiveVar(testVarData.name, testVarData.value)
  const testVar = makeVarStateSynced(1, testVarData.name)
  expect(testVar()).toBe(testVarData.value)
})

test('should not restore expired reactive variables.', () => {
  persistReactiveVar(testVarData.name, testVarData.value)
  setTimeout(
    () => {
      const originalValue = 1
      const testVar = makeVarStateSynced(originalValue, testVarData.name)
      expect(testVar()).toBe(originalValue)
    },
    (globalConfig.persistedCacheExpiryMilliseconds ?? 0) + 2
  )
})

describe(`When reactive variable's value is changed`, () => {
  test.each<ShouldBroadcastTestParamType>(
    [
      {
        testName: `should broadcast and persist.`,
        config: {},
        expectToBeBroadcasted: true,
        expectToBePersisted: true,
      },
      {
        testName: `If shouldNotBroadcastFilter returns false, should broadcasted.`,
        config: { shouldNotBroadcastFilter: () => false },
        expectToBeBroadcasted: true,
        expectToBePersisted: true,
      },
      {
        testName: `If shouldNotBroadcastFilter returns true, should not broadcasted.`,
        config: { shouldNotBroadcastFilter: () => true },
        expectToBeBroadcasted: false,
        expectToBePersisted: true,
      },
      {
        testName: `If shouldNotPersistFilter returns false, should persist.`,
        config: { shouldNotPersistFilter: () => false },
        expectToBeBroadcasted: true,
        expectToBePersisted: true,
      },
      {
        testName: `If shouldNotPersistFilter returns true, should not persist.`,
        config: { shouldNotPersistFilter: () => true },
        expectToBeBroadcasted: true,
        expectToBePersisted: false,
      },
      {
        testName: `If the new value is the same as the previous value, should neither broadcase nor persist.`,
        config: {},
        expectToBeBroadcasted: false,
        expectToBePersisted: false,
        testVarInitialValue: [],
        testVarNewValue: [],
      },
      {
        testName: `If skipDefaultComparison is set to true, even if the new value is the same as the previous value, should broadcast and persist.`,
        config: {
          skipDefaultComparison: true,
          shouldNotBroadcastFilter: () => false,
        },
        expectToBeBroadcasted: true,
        expectToBePersisted: true,
        testVarInitialValue: [],
        testVarNewValue: [],
      },
      {
        testName: `if doNotBroadcast option is true, should not broadcast.`,
        updateOptions: { doNotBroadcast: true },
        expectToBeBroadcasted: false,
        expectToBePersisted: true,
      },
      {
        testName: `if doNotPersist option is true, should not persist.`,
        updateOptions: { doNotPersist: true },
        expectToBeBroadcasted: true,
        expectToBePersisted: false,
      },
    ].map((testParams: ShouldBroadcastTestParamType) => {
      if (
        !(
          ('testVarInitialValue' satisfies keyof typeof testParams) in
          testParams
        )
      )
        testParams.testVarInitialValue = 1
      if (
        !(('testVarNewValue' satisfies keyof typeof testParams) in testParams)
      )
        testParams.testVarNewValue = testVarData.value
      return testParams
    })
  )(`$testName`, async (testParams: ShouldBroadcastTestParamType) => {
    const testVarName = testVarData.name

    //  creating reactive variable
    const testVar = makeVarStateSynced(
      testParams.testVarInitialValue,
      testVarName,
      testParams.config
    )

    const debounceSpy = vi.spyOn(synchronizationDebouncer, 'debounce')

    //  updating the reactive variable
    testVar(testParams.testVarNewValue, testParams.updateOptions)

    if (testParams.expectToBeBroadcasted)
      expect(debounceSpy).toHaveBeenCalledTimes(1)
    else expect(debounceSpy).not.toHaveBeenCalled()

    const bc = MockBroadcastChannel.getBroadcastChannel()
    const postSpy = vi.spyOn(bc, 'postMessage')

    //  awaiting debounce timeout

    vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs)

    if (testParams.expectToBeBroadcasted)
      expect(postSpy).toHaveBeenCalledWith(testParams.testVarNewValue)
    else expect(postSpy).not.toHaveBeenCalled()
    if (testParams.expectToBePersisted)
      expect(localStorageSetSpy).toHaveBeenCalled()
    else expect(localStorageSetSpy).not.toHaveBeenCalled()
  })
})

test('listener applies incoming operations without re-broadcasting or persisting', () => {
  const testVarName = testVarData.name
  const testVar = makeVarStateSynced(1, testVarName)
  const bc = MockBroadcastChannel.getBroadcastChannel()
  const postSpy = vi.spyOn(bc, 'postMessage')

  bc.emitMessage(testVarData.value)
  expect(testVar()).toBe(testVarData.value)

  vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs)

  expect(postSpy).not.toHaveBeenCalledWith()
  expect(localStorageSetSpy).not.toHaveBeenCalled()
})

test.each<{ shouldDebounce: boolean; expectToBeBroadcasted: boolean }>([
  {
    shouldDebounce: false,
    expectToBeBroadcasted: false,
  },
  {
    shouldDebounce: true,
    expectToBeBroadcasted: true,
  },
])(
  `if isSubscriptionRes is true, should broadcast only if debouncer's timer is running.`,
  async (testParams) => {
    const testVarName = testVarData.name
    const testVar = makeVarStateSynced<number>(1, testVarName)

    if (testParams.shouldDebounce)
      synchronizationDebouncer.graphqlRequestStarted()

    testVar(testVarData.value, { isSubscriptionRes: true })

    if (testParams.shouldDebounce)
      synchronizationDebouncer.graphqlRequestCompleted()

    const bc = MockBroadcastChannel.getBroadcastChannel()

    const postSpy = vi.spyOn(bc, 'postMessage')
    expect(postSpy).not.toHaveBeenCalled()

    vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs)

    if (testParams.expectToBeBroadcasted)
      expect(postSpy).toHaveBeenCalledWith(testVarData.value)
    else expect(postSpy).not.toHaveBeenCalled()
  }
)
