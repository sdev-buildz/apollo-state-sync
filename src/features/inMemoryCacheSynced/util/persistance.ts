import type { InMemoryCache } from '@apollo/client'
import {
  getPersistedState,
  updatePersistedState,
} from '../../../util/persistedState'

/**
 * Persists the state of the cache to the the local storage,
 *  so that new browsing contexts can rettore.
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
 * Restores from local storage. Used when web page loads.
 */
export const restorePersisted = (
  inMemoryStore: Pick<InMemoryCache, 'extract' | 'restore'>
) => {
  try {
    const persistedState = getPersistedState()

    if (!persistedState || Date.now() > persistedState.expiresAt) {
      /** If the cache is expired, do not restore */
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
