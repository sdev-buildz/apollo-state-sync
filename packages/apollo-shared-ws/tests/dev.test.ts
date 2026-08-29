/**
 * @packageDocumentation
 * For testing the cli in development environment.
 */
vi.mock('../migration', () => {
  return {
    migrate: vi.fn(),
  }
})

import { cliApp } from '@bin'
import { buildContextForTest } from '@packages/common-utils/cli-utils'
import * as migration from '@packages/migration'
import { run } from '@stricli/core'
import { describe, expect, test, vi } from 'vitest'

const migrateSpy = vi.spyOn(migration, 'migrate').mockImplementation(() => {
  throw new Error('migrate should not be called')
})

describe('cli in development environment', () => {
  const contextForTest = buildContextForTest()

  test(`cli's own source code should not be edited by accidental invocations of cli commands.`, async () => {
    process.env.CLI_EXEC_TEST = 'true'
    await run(cliApp, [], contextForTest)
    expect(migrateSpy).not.toHaveBeenCalled()
  })
})
