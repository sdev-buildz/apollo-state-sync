import { MockBroadcastChannel } from '../../../lib/MockBroadcastChannel'
// Mocks must be imported before importing the conssuming modules
import { gql, InMemoryCache } from '@apollo/client'
import { globalConfig, type CacheSyncerConfigType } from '../../../globalConfig'
import {
  getPersistedState,
  updatePersistedState,
} from '../../../util/persistedState'
import { setupCacheSyncer } from '../setupCacheSyncer'
import { persistInMemoryCache, restorePersisted } from '../util/persistance'

import { canonicalSerialization } from 'canonical-serialization'
import { beforeEach, describe, expect, it, test, vi, type Mock } from 'vitest'
import { synchronizationDebouncer } from '../../../util/synchronizationDebouncer'
import { InMemoryCacheSynced } from '../InMemoryCacheSynced'
import {
  cacheOperationsToSync,
  type CacheOperationsToSyncType,
  type CacheSyncMessageTypeMap,
} from '../util/in-memory-cache.types'
import type { InMemoryCacheSyncedType } from '../util/InMemoryCacheSyncedType'
import { cacheStateChecks } from './cacheStateChecls'
import { initializeTestData } from './testData'
import { getListenedMessage } from './testDataForListeners'
import { writeOptionsParams, type GqlQueryType } from './writeOptionsParams'

vi.useFakeTimers()

describe.each<{
  testName: string
  cacheInitializer: (options?: CacheSyncerConfigType) => InMemoryCacheSyncedType
}>([
  {
    testName: 'setupCacheSyncer function.',
    cacheInitializer: (options) =>
      setupCacheSyncer(new InMemoryCache(), options),
  },
  {
    testName: 'InMemoryCacheSynced class.',
    cacheInitializer: (options) => new InMemoryCacheSynced(undefined, options),
  },
])('$testName', async ({ cacheInitializer }) => {
  let inMemoryCache: InMemoryCacheSyncedType

  /**
   *  Test data for cache operations.
   */
  let testData: ReturnType<typeof initializeTestData>

  const debounceSpy = vi.spyOn(synchronizationDebouncer, 'debounce')
  const bc = MockBroadcastChannel.instances[0]!
  const postSpy = vi.spyOn(bc, 'postMessage')

  const localStorageSetSpy = vi.spyOn(Storage.prototype, 'setItem')
  const localStorageGetSpy = vi.spyOn(Storage.prototype, 'getItem')

  /**
   * Compares the persisted state with the current state of the in-memory cache.
   */
  const compareLsAndCache = (expectToBeEqual = true) => {
    const persistedData = getPersistedState()
    const extracted = inMemoryCache.extract()
    if (expectToBeEqual) expect(persistedData?.cache).toStrictEqual(extracted)
    else expect(persistedData?.cache).not.toStrictEqual(extracted)
  }

  let operationSpies: Record<CacheOperationsToSyncType, Mock>

  /** Initializes the spies on the cache operations. */
  const initializeOperationSpies = () => {
    operationSpies = {
      write: vi.spyOn(inMemoryCache, 'write'),
      evict: vi.spyOn(inMemoryCache, 'evict'),
      modify: vi.spyOn(inMemoryCache, 'modify'),
      gc: vi.spyOn(inMemoryCache, 'gc'),
      reset: vi.spyOn(inMemoryCache, 'reset'),
      retain: vi.spyOn(inMemoryCache, 'retain'),
      release: vi.spyOn(inMemoryCache, 'release'),
    }
  }

  const resetInMemoryCache = async (options?: {
    setupSyncFilters?: Parameters<typeof setupCacheSyncer>[1]
  }) => {
    // inMemoryCache = new InMemoryCache()
    // inMemoryCache = setupCacheSyncer(inMemoryCache, options?.setupSyncFilters)
    inMemoryCache = cacheInitializer(options?.setupSyncFilters)
    inMemoryCache.writeQuery({
      query: writeOptionsParams.existingField.query,
      data: { existingField: writeOptionsParams.existingField.data },
    })
    initializeOperationSpies()

    await vi.advanceTimersByTimeAsync(
      globalConfig.synhnorizationDebounceTimeoutMs
    )

    vi.clearAllMocks()
    const bc = MockBroadcastChannel.instances[0]
    expect(bc).toBeDefined()

    testData = initializeTestData(inMemoryCache)
  }

  beforeEach(async () => {
    localStorage.clear()
    await resetInMemoryCache()
  })

  it('restores persisted cache during initialization.', () => {
    const persistedState: Parameters<typeof updatePersistedState>[0] = {
      cache: {},
    }
    updatePersistedState(persistedState)
    inMemoryCache = new InMemoryCache()
    const restoreSpy = vi.spyOn(inMemoryCache, 'restore')

    inMemoryCache = setupCacheSyncer(inMemoryCache)
    expect(restoreSpy).toHaveBeenCalledWith(persistedState.cache)
  })

  test('when cache.write is called, should broadcast and persist', async () => {
    await cacheStateChecks.write.before(inMemoryCache)

    //  Writing the node to the cache
    inMemoryCache.writeQuery(writeOptionsParams.writtenField)
    expect(debounceSpy).toHaveBeenCalledTimes(1)
    expect(postSpy).not.toHaveBeenCalled()

    vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs)
    //  The write operation should be broadcasted
    expect(postSpy).toHaveBeenCalledWith<[CacheSyncMessageTypeMap['write']]>({
      operationName: 'write',
      args: [
        {
          dataId: 'ROOT_QUERY',
          query: writeOptionsParams.writtenField.query,
          result: writeOptionsParams.writtenField.data,
        },
      ],
    })

    //  The operation should be persisted
    expect(localStorageSetSpy).toHaveBeenCalled()

    compareLsAndCache()

    await cacheStateChecks.write.after(inMemoryCache)
  })

  test('when cache.write is called by graphql subscriptions, should not broadcast but should persist.', async () => {
    vi.clearAllMocks()
    //  Writing the node to the cache
    inMemoryCache.write({
      dataId: 'ROOT_SUBSCRIPTION',
      query: gql`
        subscription operationNameExample {
          iterator
        }
      `,
      result: {
        iterator: 1,
      },
    })

    vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs)
    expect(debounceSpy).not.toHaveBeenCalled()
    expect(postSpy).not.toHaveBeenCalled()

    //  The operation should be persisted
    expect(localStorageSetSpy).toHaveBeenCalled()

    expect({ a: 1, b: { c: 2, d: 3 }, e: { g: 5 } }).toMatchObject({
      b: { c: 2 },
    })

    expect(inMemoryCache.extract()).toMatchObject({
      ROOT_SUBSCRIPTION: {
        iterator: 1,
      },
    })

    compareLsAndCache()
  })

  test('when cache.evict is called, should broadcast and persist', async () => {
    await cacheStateChecks.evict.before(inMemoryCache)

    expect(postSpy).not.toHaveBeenCalled()

    //  The node should exist before eviction
    const nodeBeforeEviction = inMemoryCache.readQuery<
      GqlQueryType<'existingField'>
    >({
      query: writeOptionsParams.existingField.query,
    })
    if (nodeBeforeEviction === undefined || nodeBeforeEviction === null)
      throw new Error('nodeBefore value is not valid')

    //  Calling evict
    const evicted = inMemoryCache.evict({
      id: inMemoryCache.identify(nodeBeforeEviction.existingField)!,
    })

    expect(evicted).toBe(true)

    expect(debounceSpy).toHaveBeenCalledTimes(1)
    expect(postSpy).not.toHaveBeenCalled()

    vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs)

    expect(postSpy).toHaveBeenCalledWith<[CacheSyncMessageTypeMap['evict']]>({
      operationName: 'evict',
      args: [{ id: testData.evict.data.existingFieldCacheId }],
    })
    expect(localStorageSetSpy).toHaveBeenCalledTimes(1)
    compareLsAndCache()

    await cacheStateChecks.evict.after(inMemoryCache)
  })

  test('when cache.modify is called, should broadcast and persist', async () => {
    await cacheStateChecks.modify.before(inMemoryCache)

    // calling modify
    const modified = inMemoryCache.modify(...testData.modify.message.args)
    expect(debounceSpy).toHaveBeenCalledTimes(1)
    expect(postSpy).not.toHaveBeenCalled()

    vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs)

    expect(postSpy).toHaveBeenCalledWith<[CacheSyncMessageTypeMap['modify']]>(
      testData.modify.message
    )
    expect(localStorageSetSpy).toHaveBeenCalled()
    compareLsAndCache()

    expect(modified).toBe(true)

    await cacheStateChecks.modify.after(inMemoryCache, testData)
  })

  test.each<{
    retain: boolean
    release: boolean
    garbageCollected: boolean
  }>([
    {
      retain: false,
      release: false,
      garbageCollected: true,
    },
    {
      retain: true,
      release: false,
      garbageCollected: false,
    },
    {
      retain: true,
      release: true,
      garbageCollected: true,
    },
    {
      retain: false,
      release: true,
      garbageCollected: true,
    },
  ])(
    'when cache.gc is called, should broadcast and persist. cache.retain and cache.release also should be synced.',
    async (testProps) => {
      inMemoryCache.writeQuery(writeOptionsParams.toBeEvicted)
      /** The cache id of the node to be evicted */
      const toBeEvictedCacheId = inMemoryCache.identify(
        writeOptionsParams.toBeEvicted.data.toBeEvicted
      )

      /** The cache id of the node to be garbage collected */
      const toBeGcedCacheId = inMemoryCache.identify(
        writeOptionsParams.toBeGarbaseCollected.data.toBeGced
      )
      if (!toBeEvictedCacheId || !toBeGcedCacheId)
        throw new Error('id is undefined')

      inMemoryCache.evict({ id: toBeEvictedCacheId })

      vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs)
      vi.clearAllMocks()

      if (testProps.retain) {
        // executing retain
        inMemoryCache.retain(toBeGcedCacheId)
        expect(debounceSpy).toHaveBeenCalledTimes(1)
        expect(postSpy).not.toHaveBeenCalled()

        vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs)

        // retain should have been broadcasted
        expect(postSpy).toHaveBeenLastCalledWith<
          [CacheSyncMessageTypeMap['retain']]
        >({
          operationName: 'retain',
          args: [toBeGcedCacheId],
        })
      }

      debounceSpy.mockClear()
      postSpy.mockClear()

      if (testProps.release) {
        // executing release
        inMemoryCache.release(toBeGcedCacheId)
        expect(debounceSpy).toHaveBeenCalledTimes(1)
        expect(postSpy).not.toHaveBeenCalled()

        vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs)

        // release should have been broadcasted
        expect(postSpy).toHaveBeenLastCalledWith<
          [CacheSyncMessageTypeMap['release']]
        >({
          operationName: 'release',
          args: [toBeGcedCacheId],
        })
      }
      // performing gc operation
      const r = inMemoryCache.gc(...testData.gc.message.args)

      vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs)

      expect(postSpy).toHaveBeenCalledWith<[CacheSyncMessageTypeMap['gc']]>(
        testData.gc.message
      )
      expect(localStorageSetSpy).toHaveBeenCalled()
      compareLsAndCache()
      expect(r).toStrictEqual(
        testProps.garbageCollected ? [toBeGcedCacheId] : []
      )
    }
  )

  test('when cache.reset is called, should broadcast and persist', async () => {
    await cacheStateChecks.reset.before(inMemoryCache)

    await inMemoryCache.reset(...testData.reset.message.args)

    expect(debounceSpy).toHaveBeenCalledTimes(1)
    expect(postSpy).not.toHaveBeenCalled()

    vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs)

    expect(postSpy).toHaveBeenCalledWith<[CacheSyncMessageTypeMap['reset']]>(
      testData.reset.message
    )
    expect(localStorageSetSpy).toHaveBeenCalled()
    expect(inMemoryCache.extract()).toStrictEqual({})
    compareLsAndCache()

    await cacheStateChecks.reset.after(inMemoryCache)
  })

  test.each<CacheOperationsToSyncType>(cacheOperationsToSync)(
    '%s operations with skipBroadcastFilter true, should not be broadcasted',
    async (operationToSkip) => {
      await resetInMemoryCache({
        setupSyncFilters: {
          skipBroadcastFilter: () => true,
        },
      })
      //  executing operation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (inMemoryCache[operationToSkip] as any)(
        ...testData[operationToSkip].message.args
      )
      expect(debounceSpy).not.toHaveBeenCalled()
      expect(localStorageSetSpy).toHaveBeenCalled()

      //  awaiting debounce

      vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs)

      // expect not to have been broadcasted
      expect(postSpy).not.toHaveBeenCalled()
    }
  )

  test.each<CacheOperationsToSyncType>(cacheOperationsToSync)(
    'Incoming %s operations with skipListenFilter true, should not be applied',
    async (operationToSkip) => {
      resetInMemoryCache({
        setupSyncFilters: {
          skipListenedFilter: () => true,
        },
      })
      bc.emitMessage(testData[operationToSkip].message)
      expect(operationSpies[operationToSkip]).not.toHaveBeenCalled()
    }
  )

  test.each<CacheOperationsToSyncType>(cacheOperationsToSync)(
    'The %s operations with skipPersistFilter true, should not be persisted',
    async (operationToSkip) => {
      resetInMemoryCache({
        setupSyncFilters: {
          skipPersistFilter: () => true,
        },
      })
      await new Promise<void>((resolve, reject) => {
        process.nextTick(() => resolve())
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (inMemoryCache[operationToSkip] as any)(
        ...testData[operationToSkip].message.args
      )

      vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs)

      expect(localStorageSetSpy).not.toHaveBeenCalled()
      if (
        operationToSkip !== 'gc' &&
        operationToSkip !== 'retain' &&
        operationToSkip !== 'release'
      )
        compareLsAndCache(false)
    }
  )

  it(`doesn't restore expired persisted cache.`, async () => {
    const expiryMilliseconds = globalConfig.persistedCacheExpiryMilliseconds
    const inMemoryStore = setupCacheSyncer(new InMemoryCache()) as InMemoryCache
    /** Persisting cache. */
    persistInMemoryCache(inMemoryStore)
    expect(localStorageSetSpy).toHaveBeenCalledTimes(1)

    vi.clearAllMocks()
    /** Restoring the persisted cache before cache expiry. */
    restorePersisted(inMemoryStore)
    expect(localStorageGetSpy).toHaveBeenCalledTimes(1)

    // awaiting until cache expires
    await vi.advanceTimersByTimeAsync(expiryMilliseconds)
    const nextDate = new Date(Date.now() + expiryMilliseconds)
    vi.setSystemTime(nextDate)

    vi.clearAllMocks()

    // trying to restore after cache expired
    const restoreSpy = vi.spyOn(inMemoryStore, 'restore')
    restorePersisted(inMemoryStore)

    // expect not to have been restored
    expect(localStorageGetSpy).toHaveBeenCalledTimes(1)
    expect(restoreSpy).not.toHaveBeenCalled()
    compareLsAndCache(false)
  })

  test.each<CacheOperationsToSyncType>(['write', 'evict', 'modify', 'reset'])(
    '%s operation listener applies incoming operations. But it neither re-broadcasts nor persists.',
    async (operationName) => {
      if (
        operationName !== 'gc' &&
        operationName !== 'retain' &&
        operationName !== 'release'
      )
        await cacheStateChecks[operationName].before(inMemoryCache)

      // Simulating incoming message from different context
      bc.emitMessage(testData[operationName].message)

      vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs)

      //  expect to have been processed by listeners
      expect(operationSpies[operationName]).toHaveBeenCalledTimes(1)
      expect(
        canonicalSerialization(
          operationSpies[operationName].mock.calls[
            operationSpies[operationName].mock.calls.length - 1
          ]
        )
      ).toBe(
        canonicalSerialization(
          getListenedMessage(testData[operationName].message).args
        )
      )

      expect(postSpy).not.toHaveBeenCalled()
      expect(localStorageSetSpy).not.toHaveBeenCalled()

      if (
        operationName !== 'gc' &&
        operationName !== 'retain' &&
        operationName !== 'release'
      )
        await cacheStateChecks[operationName].after(inMemoryCache, testData)
    }
  )

  test.each<{
    retain: boolean
    release: boolean
    garbageCollected: boolean
  }>([
    {
      retain: false,
      release: false,
      garbageCollected: true,
    },
    {
      retain: true,
      release: false,
      garbageCollected: false,
    },
    {
      retain: true,
      release: true,
      garbageCollected: true,
    },
    {
      retain: false,
      release: true,
      garbageCollected: true,
    },
  ])(
    'gc, retain and release operations are handled by listeners but they neither re-broadcast nor persist.',
    async (testProps) => {
      inMemoryCache.writeQuery(writeOptionsParams.toBeEvicted)
      /** The cache id of the node to be evicted */
      const toBeEvictedCacheId = inMemoryCache.identify(
        writeOptionsParams.toBeEvicted.data.toBeEvicted
      )

      /** The cache id of the node to be garbage collected */
      const toBeGcedCacheId = inMemoryCache.identify(
        writeOptionsParams.toBeGarbaseCollected.data.toBeGced
      )
      if (!toBeEvictedCacheId || !toBeGcedCacheId)
        throw new Error('id is undefined')

      inMemoryCache.evict({ id: toBeEvictedCacheId })

      vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs)
      vi.clearAllMocks()

      if (testProps.retain) {
        // executing retain
        bc.emitMessage({
          operationName: 'retain',
          args: [toBeGcedCacheId],
        })

        vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs)
        expect(postSpy).not.toHaveBeenCalled()
      }

      postSpy.mockClear()

      if (testProps.release) {
        // executing release
        bc.emitMessage({
          operationName: 'release',
          args: [toBeGcedCacheId],
        })

        vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs)

        expect(postSpy).not.toHaveBeenCalled()
      }

      bc.emitMessage({
        operationName: 'gc',
        args: testData.gc.message.args,
      })

      vi.advanceTimersByTime(globalConfig.synhnorizationDebounceTimeoutMs)
      expect(postSpy).not.toHaveBeenCalled()

      expect(localStorageSetSpy).not.toHaveBeenCalled()
      expect(operationSpies['gc']).toHaveReturnedWith(
        testProps.garbageCollected ? [toBeGcedCacheId] : []
      )
    }
  )
})
