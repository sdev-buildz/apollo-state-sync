import { gql } from '@apollo/client'
import type { StrictExtract } from 'ts-strict-utils'
import type { InMemoryCacheSynced } from '../InMemoryCacheSynced'
import {
  shouldNotBroadcastSymbol,
  shouldNotPersistSymbol,
  type CacheOperationsToSyncType,
  type CacheSyncMessageType,
} from './in-memory-cache.types'

/**
 * Process the listened args before applying in the current
 *  browsing context.
 */
export const processIncomingArgs = (
  broadcastOperation: CacheSyncMessageType
): Parameters<InMemoryCacheSynced[CacheOperationsToSyncType]> => {
  let processedArgs: Parameters<InMemoryCacheSynced[CacheOperationsToSyncType]>

  if (broadcastOperation.operationName === 'write') {
    const typedArgs =
      broadcastOperation.args as CacheSyncMessageType<'write'>['args']
    processedArgs = [
      {
        ...typedArgs[0],
        query: gql(typedArgs[0].query as string),
      },
    ]
  } else
    processedArgs = broadcastOperation.args as CacheSyncMessageType<
      StrictExtract<CacheOperationsToSyncType, 'write'>
    >['args']

  processedArgs = [
    {
      ...(typeof processedArgs[0] !== 'string'
        ? processedArgs[0]
        : ({
            value: processedArgs[0],
          } satisfies Parameters<InMemoryCacheSynced['retain']>[0])),
      [shouldNotBroadcastSymbol]: true,
      [shouldNotPersistSymbol]: true,
    },
    ...processedArgs.slice(1),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ] as any

  return processedArgs
}
