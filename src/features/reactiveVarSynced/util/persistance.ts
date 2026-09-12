import type { ReactiveVar } from '@apollo/client'
import {
  getPersistedState,
  updatePersistedState,
  type PersistedStateType,
} from '../../../util/persistedState'

/**
 * Fetches the persisted reactive variables from local storage.
 */
export function getPersistedReactiveVars(): PersistedStateType['reactiveVars'] {
  const persistedState = getPersistedState()
  return persistedState?.reactiveVars ?? {}
}

/**
 * Saves the value of a reactive variable to local storage.
 * @param name - The unique key used to store the variable in `localStorage`.
 * @param value - The reactive variable instance or current value to be persisted.
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
