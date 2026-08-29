import serializeJavascript from 'serialize-javascript'
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

  return {
    ...bcedMessage,
    args: [
      {
        ...(typeof bcedMessage.args[0] === 'string'
          ? { value: message.args[0] }
          : bcedMessage.args[0]),
        [shouldNotBroadcastSymbol]: true,
        [shouldNotPersistSymbol]: true,
      },
      ...bcedMessage.args.slice(1),
    ],
  }
}
