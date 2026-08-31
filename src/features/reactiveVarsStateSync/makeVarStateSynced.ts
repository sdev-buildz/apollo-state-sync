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
  ReactiveVarStateSync,
  RVarStateSyncConfigType,
  SetReactiveVarOptionsType,
} from './util/types'

/**
 * Maintains unique names for reactive variables
 *  1) to uniquely identify them in the local storage.
 *  2) to apply broadcasted changes to the corresponding variable in listening browsing contexts.
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
 *  Used in place of {@link makeVar}.
 *  It wraps {@link makeVar} internally.
 *  Sets up state synchronization on the newly created reactive variable.
 *  @param value - The initial value of the reactive variable.
 *  @param name - A unique name for the reactive variable.
 *  @example
 * ```ts
 * import { useReactiveVar } from '@apollo/client/react'
 *
 * const rVarSynced = makeVarStateSynced('random-value','a-unique-name')
 * ```
 */
export const makeVarStateSynced = <T>(
  value: T,
  uniqueName: string,
  config?: RVarStateSyncConfigType<T>
): ReactiveVarStateSync<T> => {
  const persistedReactiveVars = getPersistedReactiveVars()
  /**
   * The newly created reactive variable.
   */
  const reactiveVar = makeVar(value)
  ChannelNames.validateUniqueness(
    uniqueName,
    reactiveVar as ReactiveVar<unknown>
  )
  /**
   * Persisted apollo state is restored once the page loads.
   * The value from the persisted state overwrites the value from the argument
   *  {@link value} of this function call.
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
  const reactiveVarStateSync = (
    newValue?: T,
    options?: SetReactiveVarOptionsType
  ) => {
    const currentValue = reactiveVar()
    if (!newValue) return currentValue

    const toReturn = reactiveVar(newValue)
    // If value is not changed then no need to broadcast
    if (
      !config?.skipDefaultComparison &&
      canonicalSerialization(value) === canonicalSerialization(newValue)
    )
      return toReturn

    // Handling broadcasting of reactive variable
    let shouldBroadcast: boolean = true
    if (options?.doNotBroadcast) shouldBroadcast = false
    if (options?.isSubscriptionRes && !synchronizationDebouncer.isPending)
      shouldBroadcast = false

    shouldBroadcast &&= Boolean(
      !config?.shouldNotBroadcastFilter?.(
        newValue,
        value,
        uniqueName,
        synchronizationDebouncer.isPending
      )
    )
    if (shouldBroadcast) {
      synchronizationDebouncer.debounce(() => {
        reactiveVarBc.postMessage(newValue)
      })
    }

    // Handling persisting of reactive variable
    if (
      config?.shouldNotPersistFilter?.(newValue, value, uniqueName) ||
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

  return reactiveVarStateSync as ReactiveVarStateSync<T>
}
