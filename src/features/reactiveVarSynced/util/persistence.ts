import type { ReactiveVar } from '@apollo/client'
import {
  getPersistedState,
  updatePersistedState,
  type PersistedStateType,
} from '../../../util/persistedState'

/**
 * Reads the persisted reactive variables from local storage.
 * @returns the persisted reactive variables, or an empty object when none
 * are available.
 */
export function getPersistedReactiveVars(): PersistedStateType['reactiveVars'] {
  const persistedState = getPersistedState()
  return persistedState?.reactiveVars ?? {}
}

/**
 * Persists the current value of a reactive variable in local storage.
 * @param name - the unique key used to store the variable.
 * @param name - the unique key used to store the variable.
 * @param value - the current value to persist.
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
