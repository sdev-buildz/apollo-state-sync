vi.mock('../migration', () => {
  return {
    migrate: vi.fn(),
  }
})

vi.mock('../../package.json', () => {
  return {
    default: {
      name: 'test case name',
    },
  }
})
import { buildContextForTest } from '@packages/common-utils/cli-utils'
import type { MigrateOptionsType } from '@packages/migration'
import * as migration from '@packages/migration'
import { run } from '@stricli/core'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { cliApp } from './cliApp'

const migrateSpy = vi.spyOn(migration, 'migrate').mockImplementation(vi.fn())

describe('cli', () => {
  const contextForTest = buildContextForTest()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test.skip('importing the ts file to stimulate cli invocation.', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('./index.ts')

    expect(migrateSpy).toHaveBeenCalled()
  })

  test(`If --help arg is present, the migrate function should not be executed.`, async () => {
    await run(cliApp, ['--help'], contextForTest)
    expect(migrateSpy).not.toHaveBeenCalled()
  })

  test('invocation with no arguments', async () => {
    await run(cliApp, [], contextForTest)
    const migrateOptions: MigrateOptionsType = {
      tsConfigFilePath: './tsconfig.json',
      toMigrate: {
        inMemoryCache: true,
        makeVar: true,
        stateSyncLink: true,
        graphqlWs: false,
        restartSub: false,
      },
    }
    expect(migrateSpy).toHaveBeenCalledWith(migrateOptions)
  })

  test('tsConfigFilePath flag passed', async () => {
    await run(
      cliApp,
      ['--tsConfigFilePath', './sub-project/tsconfig.json'],
      contextForTest
    )
    const migrateOptions: MigrateOptionsType = {
      tsConfigFilePath: './sub-project/tsconfig.json',
      toMigrate: {
        inMemoryCache: true,
        makeVar: true,
        stateSyncLink: true,
        graphqlWs: false,
        restartSub: false,
      },
    }
    expect(migrateSpy).toHaveBeenCalledWith(migrateOptions)
  })

  test('short-flag, kebab-case and camelCase flags', async () => {
    await run(
      cliApp,
      [
        '-t',
        './sub-project/tsconfig.json',
        '--inMemoryCache=false',
        '--make-var=false',
        '--state-sync-link=false',
        '--graphql-ws=true',
        '--restartSub=true',
      ],
      contextForTest
    )
    const migrateOptions: MigrateOptionsType = {
      tsConfigFilePath: './sub-project/tsconfig.json',
      toMigrate: {
        inMemoryCache: false,
        makeVar: false,
        stateSyncLink: false,
        graphqlWs: true,
        restartSub: true,
      },
    }
    expect(migrateSpy).toHaveBeenCalledWith(migrateOptions)
  })

  test(`boolean with negation. 'no' prefixes of flags`, async () => {
    await run(
      cliApp,
      [
        '--noInMemoryCache',
        '--no-make-var',
        '--noStateSyncLink',
        '--graphql-ws',
        '--restartSub',
      ],
      contextForTest
    )
    const migrateOptions: MigrateOptionsType = {
      tsConfigFilePath: './tsconfig.json',
      toMigrate: {
        inMemoryCache: false,
        makeVar: false,
        stateSyncLink: false,
        graphqlWs: true,
        restartSub: true,
      },
    }
    expect(migrateSpy).toHaveBeenCalledWith(migrateOptions)
  })

  test(`random flags passed`, async () => {
    await run(
      cliApp,
      [
        '-t',
        './sub-project/tsconfig.json',
        '--inMemoryCache',
        '--makeVar=false',
        '--no-graphql-ws',
        '--restartSub',
      ],
      contextForTest
    )
    const migrateOptions: MigrateOptionsType = {
      tsConfigFilePath: './sub-project/tsconfig.json',
      toMigrate: {
        inMemoryCache: true,
        makeVar: false,
        stateSyncLink: true,
        graphqlWs: false,
        restartSub: true,
      },
    }
    expect(migrateSpy).toHaveBeenCalledWith(migrateOptions)
  })
})
