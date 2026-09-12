import type { NormalizedCacheObject } from '@apollo/client'
import { globalConfig } from '../globalConfig'

/**
 * Represents the Apollo Client state saved in local storage.
 */
export type PersistedStateType = {
  cache: NormalizedCacheObject
  reactiveVars: Record<string, unknown>
  expiresAt: number
}

/**
 * Local storage key for the persisted Apollo Client state.
 */
const persistedStateKey = 'apollo-persisted-state'

/**
 * Reads the persisted Apollo Client state from local storage.
 *
 * Returns `undefined` when local storage is unavailable, no state has been
 * saved, or the saved state has expired.
 * @returns the unexpired persisted state, if available.
 */
export const getPersistedState = (): PersistedStateType | undefined => {
  if (typeof window === 'undefined') return undefined
  const stringifiedState = localStorage.getItem(persistedStateKey)
  if (!stringifiedState) return
  const persistedState = JSON.parse(stringifiedState)

  if ((persistedState?.expiresAt ?? 0) <= Date.now()) {
    return undefined
  }
  return persistedState
}

/**
 * Saves Apollo Client state to local storage.
 *
 * By default, preserves the expiration time of the existing unexpired state.
 * Set `overwriteExpiresAt` to `true` to use the expiration time in `state`.
 * @param state - the complete state object to persist.
 * @param state - the complete state object to persist.
 * @param overwriteExpiresAt - whether to replace an existing expiration time.
 */
export const setPersistedState = (
  state: PersistedStateType,
  overwriteExpiresAt = false
): void => {
  if (typeof window === 'undefined') return
  if (!overwriteExpiresAt) {
    const previousExpiresAt = getPersistedState()?.expiresAt
    state.expiresAt = previousExpiresAt ?? state.expiresAt
  }
  localStorage.setItem(persistedStateKey, JSON.stringify(state))
}

/**
 * Merges a partial update into the persisted Apollo Client state.
 *
 * Missing cache and reactive variable values are taken from the existing state.
 * When no expiration time is available, one is derived from the configured
 * persisted-cache expiry interval.
 * @param state - the state fields to add or replace.
 * @param state - the state fields to add or replace.
 */
export const updatePersistedState = (
  state: Partial<PersistedStateType>
): void => {
  const lastSetState = getPersistedState()
  const stateToSet: PersistedStateType = {
    cache: state.cache ?? lastSetState?.cache ?? {},
    reactiveVars: { ...lastSetState?.reactiveVars, ...state.reactiveVars },
    expiresAt:
      state.expiresAt ??
      lastSetState?.expiresAt ??
      Date.now() + (globalConfig.persistedCacheExpiryMilliseconds ?? 0),
  }
  setPersistedState(stateToSet)
}
