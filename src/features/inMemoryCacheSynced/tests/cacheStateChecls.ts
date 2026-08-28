import type { InMemoryCache } from '@apollo/client'
import { expect } from 'vitest'
import type { CacheOperationsToSyncType } from '../util/in-memory-cache.types'
import type { initializeTestData } from './testData'
import { writeOptionsParams, type GqlQueryType } from './writeOptionsParams'

/**
 * Tests on cache's state done before and after each cache operation in test cases.
 * @example
 * While testing write operation, it checks if the node does not exist before writing, and if it exists after writing
 */
export const cacheStateChecks: Record<
  Exclude<CacheOperationsToSyncType, 'gc' | 'retain' | 'release'>,
  {
    before: (inMemoryCache: InMemoryCache) => void | Promise<void>
    after: (
      inMemoryCache: InMemoryCache,
      testData?: ReturnType<typeof initializeTestData>
    ) => void | Promise<void>
  }
> = {
  write: {
    before: (inMemoryCache) => {
      //  The node should not have existed before writing
      const nodeBeforeWriting = inMemoryCache.readQuery<
        GqlQueryType<'writtenField'>
      >({
        query: writeOptionsParams.writtenField.query,
      })
      expect(nodeBeforeWriting).toBeNull()
    },
    after: (inMemoryCache) => {
      //  The cache should contain the newly written node
      const nodeAfterWriting = inMemoryCache.readQuery<
        GqlQueryType<'writtenField'>
      >({
        query: writeOptionsParams.writtenField.query,
      })
      expect(nodeAfterWriting).toStrictEqual(
        writeOptionsParams.writtenField.data
      )
    },
  },
  evict: {
    before: (inMemoryCache) => {
      //  The node should exist before eviction
      const nodeBeforeEviction = inMemoryCache.readQuery<
        GqlQueryType<'existingField'>
      >({
        query: writeOptionsParams.existingField.query,
      })
      expect(nodeBeforeEviction).toBeDefined()
      expect(nodeBeforeEviction).not.toBeNull()
      if (nodeBeforeEviction === undefined || nodeBeforeEviction === null)
        throw new Error('nodeBefore value is not valid')
    },
    after: (inMemoryCache) => {
      //  The node should not exist after eviction
      const nodeAfterEviction = inMemoryCache.readQuery<
        GqlQueryType<'existingField'>
      >({
        query: writeOptionsParams.existingField.query,
      })
      expect(nodeAfterEviction).toBeNull()
    },
  },
  modify: {
    before: (inMemoryCache) => {
      /** The cache id of the field to modify */
      const existingFieldCacheId = inMemoryCache.identify(
        writeOptionsParams.existingField.data
      )
      if (!existingFieldCacheId)
        throw new Error('initialFieldCacheId is undefined')
    },

    after: (inMemoryCache, testData) => {
      /** The modified node after modification. */
      const nodeAfter = inMemoryCache.readQuery<GqlQueryType<'existingField'>>({
        query: writeOptionsParams.existingField.query,
      })
      expect(nodeAfter?.existingField).toStrictEqual({
        ...writeOptionsParams.existingField.data,
        value: testData?.modify.data.modifyValueTo,
      })
    },
  },
  reset: {
    before: (inMemoryCache) => {
      expect(inMemoryCache.extract()).not.toStrictEqual({})
    },

    after: (inMemoryCache) => {
      expect(inMemoryCache.extract()).toStrictEqual({})
    },
  },
}
