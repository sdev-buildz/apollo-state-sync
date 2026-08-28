import { expect, it } from 'vitest'
import { Debouncer } from './debouncer'

it('throws when initializing with negative timeout.', () => {
  expect(() => new Debouncer(-2)).toThrow()
})
it('throws when setting negative value as timeout.', () => {
  const debouncer = new Debouncer()
  expect(() => debouncer.setTimeoutMs(-2)).toThrow()
})
