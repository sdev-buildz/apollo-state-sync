import type { ReactiveVar } from '@apollo/client'
import type { makeVarStateSynced } from '../makeVarStateSynced'

/**
 * Configuration parameter for {@link makeVarStateSynced}
 */
export type RVarStateSyncConfigType<T = unknown> = {
  /**
   * Return true if the reactive variable update should not be broadcasted.
   * @example
   *  When a reactive variable could be updated both by gql query and gql subscription operations,
   *    only the updates caused by gql query should be broadcasted.
   *    Because graphql subscriptions can be done using shared graphql-ws,
   *      which notifies the other browsing contexts directly.
   */
  shouldNotBroadcastFilter?: (
    newValue: T,
    prevValue: T,
    name: string,
    isDebounceTimerRunning: boolean
  ) => boolean

  /**
   * Return true if the reactive variable's new value should not be persisted.
   */
  shouldNotPersistFilter?: (newValue: T, prevValue: T, name: string) => boolean

  /**
   * Set to true, if the comparison of new and old reactive var values should not be done.
   *   The comparison is done to skip broadcasting if the old and new values are the same.
   *
   *   The comparison is necessary to avoid indefinite back-and-forth broadcating between browsing contexts.
   *   So do not set this to true, unless you pass a custom comparison function in
   *     {@link RVarStateSyncConfigType.shouldNotBroadcastFilter | shouldNotBroadcastFilter}.
   */
  skipDefaultComparison?: boolean
}

/**
 * Options passed while updated reactive variable whose state is synced across browsing contexts.
 */
export type SetReactiveVarOptionsType = {
  /**
   * Set to true, if this update is done in response to a graphql subscription's response.
   * This is used to avoid unnecessary broadcasts, since socket connection would have
   *    notified other browsing contexts also.
   * @default false
   * @see excalidraw diagram
   */
  isSubscriptionRes?: boolean

  /**
   * Set to true, if this update should not be broadcasted to other browsing contexts.
   * @default false
   */
  doNotBroadcast?: boolean

  /**
   * Set to true, if the apollo client's state should not be persisted as part of this update.
   * @default false
   */
  doNotPersist?: boolean
}

/**
 * Reactive variable with its state synced across browsing contexts.
 * See {@link makeVarStateSynced}
 */
export interface ReactiveVarStateSync<T> extends ReactiveVar<T> {
  (newValue?: T, options?: SetReactiveVarOptionsType): T
}
