import { expect, it } from 'vitest'
import { globalConfig } from './globalConfig'

it('maintains synhnorizationDebounceTimeoutMs field for backward compatibility.', () => {
  expect(globalConfig.synchronizationDebounceTimeoutMs).toBe(
    globalConfig.synhnorizationDebounceTimeoutMs
  )
  globalConfig.synchronizationDebounceTimeoutMs = 30
  expect(globalConfig.synchronizationDebounceTimeoutMs).toBe(
    globalConfig.synhnorizationDebounceTimeoutMs
  )
  globalConfig.synchronizationDebounceTimeoutMs = 31
  expect(globalConfig.synchronizationDebounceTimeoutMs).toBe(
    globalConfig.synhnorizationDebounceTimeoutMs
  )
  globalConfig.synhnorizationDebounceTimeoutMs = 40
})
