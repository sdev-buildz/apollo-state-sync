import type { InMemoryCache } from '@apollo/client'
import type { CacheSyncMessageTypeMap } from '../util/in-memory-cache.types'
import { writeOptionsParams } from './writeOptionsParams'

/**
 * Creates and returns the test cache opertions.
 */
export const initializeTestData = (store: InMemoryCache) => {
  const modifyValueTo = 'new value'

  const existingFieldCacheId = store.identify(
    writeOptionsParams.existingField.data
  )
  if (!existingFieldCacheId)
    throw new Error('The field supposed to be existing is not yet created.')

  /**
   *  Test data for cache operations.
   */
  const testData = {
    write: {
      message: {
        operationName: 'write',
        args: [
          {
            dataId: 'ROOT_QUERY',
            query: writeOptionsParams.writtenField.query,
            result: writeOptionsParams.writtenField.data,
          },
        ],
      },
    },
    evict: {
      data: {
        existingFieldCacheId,
      },
      message: {
        operationName: 'evict',
        args: [
          {
            id: existingFieldCacheId,
          },
        ],
      },
    },
    modify: {
      data: { modifyValueTo },
      message: {
        operationName: 'modify',
        args: [
          {
            id: existingFieldCacheId,
            fields: function (value, { fieldName }) {
              if (fieldName === 'value')
                return 'new value' satisfies typeof modifyValueTo
              return value
            },
          },
        ],
      },
    },
    gc: {
      message: {
        operationName: 'gc',
        args: [{}],
      },
    },
    reset: {
      message: {
        operationName: 'reset',
        args: [{}],
      },
    },
    retain: {
      message: {
        operationName: 'retain',
        args: [existingFieldCacheId],
      },
    },
    release: {
      message: {
        operationName: 'release',
        args: [existingFieldCacheId],
      },
    },
  } satisfies {
    [Operation in keyof CacheSyncMessageTypeMap]: {
      message: CacheSyncMessageTypeMap[Operation]
      data?: Record<string, unknown>
    }
  }

  return testData
}
