import type { InMemoryCache } from '@apollo/client'
import type { InMemoryCacheSynced } from '@root/dist/index.mjs'
import { print } from 'graphql'
import type {
  CacheSyncMessageType,
  CacheSyncMessageTypeMap,
} from '../util/in-memory-cache.types'
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fields: function (value: any, { fieldName }: any) {
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
      message: {
        operationName: Operation
        args: Parameters<InMemoryCacheSynced[Operation]>
      }
      data?: Record<string, unknown>
    }
  }

  return testData
}

/**
 * Provides the broadcast message for the given cache operation
 */
export const getBroadcastMessage = (message: {
  operationName: keyof CacheSyncMessageTypeMap
  args: Parameters<InMemoryCacheSynced[keyof CacheSyncMessageTypeMap]>
}): CacheSyncMessageType => {
  if (message.operationName !== 'write') return message
  return {
    operationName: 'write',
    args: [
      {
        ...message.args[0],
        query: print(message.args[0].query),
      },
    ],
  }
}
