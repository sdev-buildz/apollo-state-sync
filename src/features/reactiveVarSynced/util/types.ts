import type { ReactiveVar } from '@apollo/client'
import type { makeVarSynced } from '../makeVarSynced'

/**
 * Configuration options for syncing a reactive variable across browsing contexts.
 * @template T The type of the value stored in the reactive variable.
 */
export type RVarSyncedConfigType<T = unknown> = {
  /**
   * Determines whether a reactive variable update should be broadcast to other browsing contexts.
   * @param newValue - The newly updated value of the reactive variable.
   * @param prevValue - The previous value before the update.
   * @param name - The identifier or name of the reactive variable.
   * @param isDebounceTimerRunning - Indicates if a debounce timer is currently active for this variable.
   * @returns `true` if the update should **not** be broadcast to other contexts; otherwise, `false`.
   * @example
   * ```ts
   * // Prevent broadcast loops when a variable is updated by GQL subscriptions.
   * // Since WebSocket connections already notify other contexts about subscription updates directly, only
   * // updates originating from standard GraphQL queries should trigger a local broadcast.
   * shouldNotBroadcastFilter: (newValue, prevValue, name) => isFromSubscription(newValue)
   * ```
   */
  shouldNotBroadcastFilter?: (
    newValue: T,
    prevValue: T,
    name: string,
    isDebounceTimerRunning: boolean
  ) => boolean

  /**
   * Determines if the new value should skip persistence during an update.
   */
  shouldNotPersistFilter?: (newValue: T, prevValue: T, name: string) => boolean

  /**
   * Set to true, to skip the default comparison between new and old reactive var values.
   *
   * By default, this comparison prevents broadcasting if the values are identical, which
   *  is necessary to avoid infinite back-and-forth broadcasting between browsing contexts.
   *
   * Do not set this to true, unless you pass a custom comparison function in
   *  {@link RVarSyncedConfigType.shouldNotBroadcastFilter | shouldNotBroadcastFilter}.
   */
  skipDefaultComparison?: boolean
}

/**
 * Configuration options passed when updating a synced reactive variable.
 */
export type SetRVarSyncedOptionsType = {
  /**
   * Indicates if the update is a response to a GraphQL subscription.
   *
   * When `true`, this prevents redundant broadcasts because the WebSocket
   * connection directly notifies other browsing contexts.
   * @default false
   * @see excalidraw diagram
   */
  isSubscriptionRes?: boolean

  /**
   * Disables broadcasting the update to other browsing contexts.
   * @default false
   */
  doNotBroadcast?: boolean

  /**
   * Prevents the Apollo Client's state from being persisted during this update.
   * @default false
   */
  doNotPersist?: boolean
}

/**
 * Reactive variable with its state synced across browsing contexts.
 * See {@link makeVarSynced}
 */
export type ReactiveVarSynced<T> = ReactiveVar<T> & {
  (newValue?: T, options?: SetRVarSyncedOptionsType): T
}
