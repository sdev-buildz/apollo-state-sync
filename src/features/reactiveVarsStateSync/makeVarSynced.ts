import { makeVar, type ReactiveVar } from '@apollo/client'
import { canonicalSerialization } from 'canonical-serialization'
import { SerializingBroadcastChannel } from '../../lib/SerializingBroadcastChannel'
import type { TypedBroadcastChannel } from '../../lib/TypedBroadcastChannel'
import { synchronizationDebouncer } from '../../util/synchronizationDebouncer'
import {
  getPersistedReactiveVars,
  persistReactiveVar,
} from './util/persistance'
import type {
  ReactiveVarStateSynced,
  RVarStateSyncConfigType,
  SetReactiveVarOptionsType,
} from './util/types'

/**
 * Maintains unique names for reactive variables.
 *  1) to uniquely identify them in the local storage.
 *  2) to apply broadcasted changes to only the corresponding variable in listening browsing contexts.
 */
export class ChannelNames {
  static names: Set<string> = new Set([])
  static namesMap: WeakMap<ReactiveVar<unknown>, string> = new WeakMap()
  /**
   * Used to ensure the uniqueness of the names.
   * @throws when name is not unique.
   */
  static validateUniqueness(name: string, reactiveVar: ReactiveVar<unknown>) {
    if (ChannelNames.namesMap.get(reactiveVar) === name) return
    if (ChannelNames.names.has(name))
      throw new Error('Channel name is not unique. Name already taken')
    ChannelNames.names.add(name)
    ChannelNames.namesMap.set(reactiveVar, name)
  }
}

/**
 *  Creates a reactive variable synchronized across browsing contexts.
 *  Internally, it wraps {@link makeVar}.
 *  @param value - The initial value of the reactive variable.
 *  @param uniqueName - A unique name for the reactive variable.
 *  @example
 * ```ts
 * import { useReactiveVar } from '@apollo/client/react'
 * import { makeVarSynced } from 'apollo-state-sync'
 *
 * const rVarSynced = makeVarSynced('random-value','a-unique-name')
 * ```
 */
export const makeVarSynced = <T>(
  value: T,
  uniqueName: string,
  config?: RVarStateSyncConfigType<T>
): ReactiveVarStateSynced<T> => {
  const persistedReactiveVars = getPersistedReactiveVars()
  /** The new reactive variable. */
  const reactiveVar = makeVar(value)
  ChannelNames.validateUniqueness(
    uniqueName,
    reactiveVar as ReactiveVar<unknown>
  )

  /**
   * Persisted apollo state is restored once the page loads.
   * The value from the persisted state overwrites the {@link value} from the arguments.
   */
  if (uniqueName in persistedReactiveVars)
    value = persistedReactiveVars[uniqueName] as T
  reactiveVar(value)

  const reactiveVarBc = new SerializingBroadcastChannel(
    uniqueName
  ) as TypedBroadcastChannel<T>

  /** Setting up listener on the broadcast channel. */
  reactiveVarBc.addEventListener('message', (event) => {
    reactiveVar(event.data)
  })

  /** The reactive variable with its state synced across browsing contexts. */
  const reactiveVarStateSync = function (
    newValue?: T | undefined,
    options?: SetReactiveVarOptionsType
  ) {
    if (arguments.length === 0) return reactiveVar()

    const toReturn = reactiveVar(newValue)
    // If the old and new values are the same, do not broadcast.
    if (
      !config?.skipDefaultComparison &&
      canonicalSerialization(value) === canonicalSerialization(newValue)
    )
      return toReturn

    // Handling broadcasting of the reactive variable.
    let shouldBroadcast: boolean = true
    if (options?.doNotBroadcast) shouldBroadcast = false
    if (options?.isSubscriptionRes && !synchronizationDebouncer.isPending)
      shouldBroadcast = false

    shouldBroadcast &&= Boolean(
      !config?.shouldNotBroadcastFilter?.(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        newValue as any,
        value,
        uniqueName,
        synchronizationDebouncer.isPending
      )
    )
    if (shouldBroadcast) {
      synchronizationDebouncer.debounce(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        reactiveVarBc.postMessage(newValue as any)
      })
    }

    // Handling persistance of the reactive variable.
    if (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config?.shouldNotPersistFilter?.(newValue as any, value, uniqueName) ||
      options?.doNotPersist
    )
      return toReturn
    try {
      persistReactiveVar(uniqueName, newValue)
    } catch (err) {
      console.error('Error while persisting reactive variables.\n', err)
    }
    return toReturn
  }

  reactiveVarStateSync.onNextChange = reactiveVar.onNextChange
  reactiveVarStateSync.attachCache = reactiveVar.attachCache
  reactiveVarStateSync.forgetCache = reactiveVar.forgetCache

  return reactiveVarStateSync as ReactiveVarStateSynced<T>
}
