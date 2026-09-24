import { gql } from '@apollo/client'
import serializeJavascript from 'serialize-javascript'
import type { StrictExtract } from 'ts-strict-utils'
import type { InMemoryCacheSynced } from '../InMemoryCacheSynced'
import type {
  CacheOperationsToSyncType,
  CacheSyncMessageType,
  CacheSyncMessageTypeMap,
} from '../util/in-memory-cache.types'
import {
  shouldNotBroadcastSymbol,
  shouldNotPersistSymbol,
} from '../util/in-memory-cache.types'

/**
 * Gets the message receieved by listeners.
 */
export const getListenedMessage = (message: CacheSyncMessageType) => {
  const bcedMessage = (0, eval)(
    `(` + serializeJavascript(message) + ')'
  ) as CacheSyncMessageTypeMap[CacheOperationsToSyncType]

  let processedArgs: Parameters<InMemoryCacheSynced[CacheOperationsToSyncType]>

  if (bcedMessage.operationName === 'write') {
    const typedArgs = bcedMessage.args as CacheSyncMessageType<'write'>['args']
    processedArgs = [
      {
        ...typedArgs[0],
        query: gql(typedArgs[0].query as string),
      },
    ]
  } else
    processedArgs = bcedMessage.args as CacheSyncMessageType<
      StrictExtract<CacheOperationsToSyncType, 'write'>
    >['args']

  return {
    ...bcedMessage,
    args: [
      {
        ...(typeof processedArgs[0] === 'string'
          ? { value: message.args[0] }
          : processedArgs[0]),
        [shouldNotBroadcastSymbol]: true,
        [shouldNotPersistSymbol]: true,
      },
      ...processedArgs.slice(1),
    ],
  }
}
