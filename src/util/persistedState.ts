import type { NormalizedCacheObject } from '@apollo/client'
import { globalConfig } from '../globalConfig'

/**
 * The apollo client's state persisted in local storage.
 */
export type PersistedStateType = {
  cache: NormalizedCacheObject
  reactiveVars: Record<string, unknown>
  expiresAt: number
}

/**
 * The local storage key of the persisted state.
 */
const persistedStateKey = 'apollo-persisted-state'

/**
 * returns the persisted state from the local storage.
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
 * sets the persisted state in the local storage
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
 * Updates the persisted state in the local storage by merging the already persisted state values with new values.
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
