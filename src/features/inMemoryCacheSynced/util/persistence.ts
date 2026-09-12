import type { InMemoryCache } from '@apollo/client'
import {
  getPersistedState,
  updatePersistedState,
} from '../../../util/persistedState'

/**
 * Persists the cache state in local storage so it can be restored in a new
 * browsing context.
 */
export const persistInMemoryCache = (
  inMemoryStore: Pick<InMemoryCache, 'extract'>
) => {
  const data = inMemoryStore.extract()
  updatePersistedState({
    cache: data,
  })
}

/**
 * Restores the persisted cache.
 */
export const restorePersisted = (
  inMemoryStore: Pick<InMemoryCache, 'extract' | 'restore'>
) => {
  try {
    const persistedState = getPersistedState()

    if (!persistedState || Date.now() > persistedState.expiresAt) {
      // Do not restore missing or expired cache state.
      return
    }

    inMemoryStore.restore({
      ...inMemoryStore.extract(),
      ...persistedState.cache,
    })
  } catch (err) {
    console.error('Error while restoring persisted cache state.\n', err)
    return
  }
}
