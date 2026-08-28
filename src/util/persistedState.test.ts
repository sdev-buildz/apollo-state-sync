import { afterAll, describe, expect, test, vi } from 'vitest'
import {
  getPersistedState,
  setPersistedState,
  updatePersistedState,
} from './persistedState'

describe('when window is undefined', () => {
  vi.stubGlobal('window', undefined)
  afterAll(() => {
    vi.unstubAllGlobals()
  })
  test('getPersistedState returns undefiend.', () => {
    expect(getPersistedState()).toBeUndefined()
  })
  test('updatePersistedState returns undefiend.', () => {
    expect(updatePersistedState({ cache: {} })).toBeUndefined()
  })
  test('setPersistedState returns undefiend.', () => {
    expect(
      setPersistedState(
        { cache: {}, expiresAt: Date.now() + 1000, reactiveVars: {} },
        true
      )
    ).toBeUndefined()
  })
})
