import type { ReactiveVar } from '@apollo/client'
import {
  getPersistedState,
  updatePersistedState,
  type PersistedStateType,
} from '../../../util/persistedState'

/**
 * Retrieves the persisted reactive variables from the local storage
 */
export function getPersistedReactiveVars(): PersistedStateType['reactiveVars'] {
  const persistedState = getPersistedState()
  return persistedState?.reactiveVars ?? {}
}

/**
 * Persists the reactive variable to the local storage
 */
export function persistReactiveVar(
  name: string,
  value: ReturnType<ReactiveVar<unknown>>
) {
  updatePersistedState({
    reactiveVars: {
      [name]: value,
    },
  })
}
