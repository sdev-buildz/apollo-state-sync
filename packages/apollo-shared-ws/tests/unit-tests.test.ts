vi.mock('../migration', () => {
  return {
    migrate: vi.fn(),
  }
})

vi.mock('../../../package.json', () => {
  return {
    default: {
      name: 'test case name',
    },
  }
})
import { cliApp } from '@bin'
import { buildContextForTest } from '@packages/common-utils/cli-utils'
import { run } from '@stricli/core'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import * as migration from '../../migration/src/migrate'

const migrateSpy = vi.spyOn(migration, 'migrate').mockImplementation(vi.fn())

describe('cli', () => {
  const contextForTest = buildContextForTest()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test.skip('importing the ts file to stimulate cli invocation.', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@bin/runCli.ts')

    expect(migrateSpy).toHaveBeenCalled()
  })

  test(`If --help arg is present, the migrate function should not be executed.`, async () => {
    await run(cliApp, ['--help'], contextForTest)
    expect(migrateSpy).not.toHaveBeenCalled()
  })

  test('invocation with no arguments', async () => {
    await run(cliApp, [], contextForTest)
    const migrateOptions: migration.MigrateOptionsType = {
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

  test('tsConfigFilePath flag passed', async () => {
    await run(
      cliApp,
      ['--tsConfigFilePath', './sub-project/tsconfig.json'],
      contextForTest
    )
    const migrateOptions: migration.MigrateOptionsType = {
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

  test('short-flag, kebab-case and camelCase flags', async () => {
    await run(
      cliApp,
      [
        '-t',
        './sub-project/tsconfig.json',
        '--graphql-ws=true',
        '--restartSub=true',
      ],
      contextForTest
    )
    const migrateOptions: migration.MigrateOptionsType = {
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
    await run(cliApp, ['--graphql-ws', '--noRestartSub'], contextForTest)
    const migrateOptions: migration.MigrateOptionsType = {
      tsConfigFilePath: './tsconfig.json',
      toMigrate: {
        inMemoryCache: false,
        makeVar: false,
        stateSyncLink: false,
        graphqlWs: true,
        restartSub: false,
      },
    }
    expect(migrateSpy).toHaveBeenCalledWith(migrateOptions)
  })

  test(`random flags passed`, async () => {
    await run(
      cliApp,
      ['-t', './sub-project/tsconfig.json', '--no-graphql-ws', '--restartSub'],
      contextForTest
    )
    const migrateOptions: migration.MigrateOptionsType = {
      tsConfigFilePath: './sub-project/tsconfig.json',
      toMigrate: {
        inMemoryCache: false,
        makeVar: false,
        stateSyncLink: false,
        graphqlWs: false,
        restartSub: true,
      },
    }
    expect(migrateSpy).toHaveBeenCalledWith(migrateOptions)
  })
})
