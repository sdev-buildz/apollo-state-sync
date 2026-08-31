import { InMemoryCache } from '@apollo/client'
import type {
  CacheSyncerConfigType,
  GlobalConfig,
} from '@root/src/globalConfig'
import { getShouldPersist, handleSyncing } from './setupBroadcastors'
import { cacheBroadcastChannel } from './util/cacheBroadcastChannel'
import {
  shouldNotBroadcastSymbol,
  shouldNotPersistSymbol,
} from './util/in-memory-cache.types'
import type { InMemoryCacheSyncedType } from './util/InMemoryCacheSyncedType'
import { persistInMemoryCache, restorePersisted } from './util/persistance'

/**
 * Apollo in-memory cache with its state synchronized across browsing contexts (such as browser tabs, windows, or iframes).
 * @example
 * ```ts
 * import { InMemoryCacheSynced, stateSyncLink } from 'apollo-state-sync'
 * import { terminatingLink } from './util/terminatingLink'
 *
 * // use InMemoryCacheSynced as Apollo Cache.
 * const apolloCache = new InMemoryCacheSynced()
 *
 * const apolloClient = new ApolloClient({
 *    //  use stateSyncLink. It is a non-terminating link.
 *    ApolloLink.from([stateSyncLink, terminatingLink]),
 *    cache: apolloCache,
 * })
 * ```
 */
export class InMemoryCacheSynced
  extends InMemoryCache
  implements InMemoryCacheSyncedType
{
  constructor(
    config?: ConstructorParameters<typeof InMemoryCache>[0],
    protected readonly stateSyncerConfig?: CacheSyncerConfigType
  ) {
    super(config)
    restorePersisted(this)
    this.setupListeners(stateSyncerConfig)
  }

  /** Listens to broadcasted cache operations emitted from other browsing contexts. */
  protected setupListeners = (
    config?: Pick<GlobalConfig, 'skipListenedFilter'>
  ) => {
    cacheBroadcastChannel.addEventListener('message', (event) => {
      const broadcastedOperation = event.data
      if (
        config?.skipListenedFilter?.(
          broadcastedOperation.operationName,
          broadcastedOperation.args
        )
      )
        return // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(this[broadcastedOperation.operationName] as any)(
        {
          ...(typeof broadcastedOperation.args[0] !== 'string'
            ? broadcastedOperation.args[0]
            : ({
                value: broadcastedOperation.args[0],
              } satisfies Parameters<typeof this.retain>[0])),
          [shouldNotBroadcastSymbol]: true,
          [shouldNotPersistSymbol]: true,
        },
        ...broadcastedOperation.args.slice(1)
      )
    })
  }

  override write(options: Parameters<InMemoryCacheSyncedType['write']>[0]) {
    const result = super.write(options)

    if (!this.stateSyncerConfig?.shouldBroadcastSubscriptionWrites) {
      /**
       * Skipping broadcasting of writes caused by graphql subscriptions.
       * @see {@link GlobalConfig.shouldBroadcastSubscriptionWrites}
       */
      if (options.dataId == 'ROOT_SUBSCRIPTION') {
        const shouldPersist: boolean = getShouldPersist(
          'write',
          [options],
          this.stateSyncerConfig
        )
        if (shouldPersist) persistInMemoryCache(this)
        return
      }
    }

    handleSyncing('write', [options], this, this.stateSyncerConfig)

    return result
  }

  override evict(options: Parameters<InMemoryCacheSyncedType['evict']>[0]) {
    const result = super.evict(options)

    handleSyncing('evict', [options], this, this.stateSyncerConfig)

    return result
  }

  override modify(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: any
  ) {
    const result = super.modify(options)

    handleSyncing('modify', [options], this, this.stateSyncerConfig)

    return result
  }

  override gc(options: Parameters<InMemoryCacheSyncedType['gc']>[0]) {
    const result = super.gc(options)

    handleSyncing('gc', [options], this, this.stateSyncerConfig)

    return result
  }

  override async reset(
    options: Parameters<InMemoryCacheSyncedType['reset']>[0]
  ) {
    const result = super.reset(options)

    handleSyncing('reset', [options], this, this.stateSyncerConfig)

    return result
  }

  override retain(...args: Parameters<InMemoryCacheSyncedType['retain']>) {
    let processedArgs: Parameters<InMemoryCache['retain']>
    if (typeof args[0] !== 'string') {
      processedArgs = [args[0]?.value, args[1]]
    } else processedArgs = args as Parameters<InMemoryCache['retain']>

    const result = super.retain(...processedArgs)

    handleSyncing('retain', args, this, this.stateSyncerConfig)

    return result
  }

  override release(...args: Parameters<InMemoryCacheSyncedType['release']>) {
    let processedArgs: Parameters<InMemoryCache['release']>
    if (typeof args[0] !== 'string') {
      processedArgs = [args[0]?.value, args[1]]
    } else processedArgs = args as Parameters<InMemoryCache['release']>

    const result = super.release(...processedArgs)

    handleSyncing('release', args, this, this.stateSyncerConfig)

    return result
  }
}
