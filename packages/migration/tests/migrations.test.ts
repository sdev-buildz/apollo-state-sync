import * as moduleMigrateApolloClientSubs from '@src/migrateApolloClientSubs.ts'
import * as moduleMigrateGqlWs from '@src/migrateGqlWs.ts'
import * as moduleMigrateInMemoryCache from '@src/migrateInMemoryCache.ts'
import * as moduleMigrateMakeVar from '@src/migrateMakeVar.ts'
import fs from 'node:fs/promises'
import path from 'node:path'
import { Project, QuoteKind } from 'ts-morph'
import { describe, expect, it, test, vi } from 'vitest'
import { migrate, migrateProject } from '../src/migrate'
import { areContentsSame, areFileStructuresSame } from './lib/compareDirs.ts'

const spies = {
  migrateApolloClientSubs: vi.spyOn(
    moduleMigrateApolloClientSubs,
    'migrateApolloClientSubs'
  ),
  migrateGqlWs: vi.spyOn(moduleMigrateGqlWs, 'migrateGqlWs'),
  migrateInMemoryCache: vi.spyOn(
    moduleMigrateInMemoryCache,
    'migrateInMemoryCache'
  ),
  migrateMakeVar: vi.spyOn(moduleMigrateMakeVar, 'migrateMakeVar'),
}

describe('migrations', () => {
  test.each<{
    testTitle: string
    folderName: string
    pathToFolder: string
    fileExtension?: '.ts' | '.tsx'
  }>([
    {
      testTitle:
        'InMemoryCache initializations should be wrapped with setupSync',
      folderName: 'in-memory-cache',
      pathToFolder: 'ts-config-project',
    },
    {
      testTitle: 'makeVar calls should be replaced with makeVarCacheSync calls',
      pathToFolder: 'ts-config-project',
      folderName: 'reactive-var',
    },
    {
      testTitle:
        'GraphqlWSLink initializations should be replaced with GraphQLSharedWsLink initializations',
      pathToFolder: 'ts-config-project',
      folderName: 'graphql-ws-link',
    },
    {
      testTitle:
        'ApolloClient initializations should be wrapped with setupRestartSubscriptions.',
      pathToFolder: 'ts-config-project',
      folderName: 'restartSub',
    },
  ])(
    `$testTitle`,
    async ({
      folderName: testProjectFolderName,
      pathToFolder,
      fileExtension = '.ts',
    }) => {
      const project = new Project()
      project.manipulationSettings.set({
        quoteKind: QuoteKind.Single,
      })
      const folderToEmitTo = `${import.meta.dirname}/test-source-files/generated/unit-test/${testProjectFolderName}`
      const fileToEmit = `${folderToEmitTo}/source${fileExtension}`
      await fs.mkdir(folderToEmitTo, { recursive: true })

      await fs.copyFile(
        path.join(
          `${import.meta.dirname}/test-source-files/test-data/`,
          pathToFolder,
          `/${testProjectFolderName}/source${fileExtension}`
        ),
        fileToEmit
      )
      project.addSourceFileAtPath(fileToEmit)

      await migrateProject(project, {
        toMigrate: {
          restartSub: true,
          graphqlWs: true,
          stateSyncLink: true,
          inMemoryCache: true,
          makeVar: true,
        },
      })

      /**
       * The source file after transformation and prettier formatting.
       */
      const transformedSourceFile = await fs.readFile(fileToEmit, 'utf-8')

      /**
       * The expected output string of the migration
       */
      const expected = await fs.readFile(
        `${__dirname}/test-source-files/test-data/expected-to-be/${testProjectFolderName}/source${fileExtension}`,
        'utf-8'
      )

      expect(transformedSourceFile).toBe(expected)
    },
    20000
  )

  it('migrates projects if tsconfig is given.', async () => {
    vi.useRealTimers()
    const sourceDir: string = path.join(
      import.meta.dirname,
      'test-source-files',
      'test-data',
      'ts-config-project'
    )
    const destDir: string = path.join(
      import.meta.dirname,
      'test-source-files',
      'generated',
      'ts-config-project'
    )
    await fs.cp(sourceDir, destDir, { recursive: true })

    await migrate({
      tsConfigFilePath: path.join(destDir, 'tsconfig.json'),
      toMigrate: {
        restartSub: true,
        graphqlWs: true,
        stateSyncLink: true,
        inMemoryCache: true,
        makeVar: true,
      },
    })

    const expectedDir: string = path.join(
      import.meta.dirname,
      'test-source-files',
      'test-data',
      'expected-to-be'
    )

    expect(await areFileStructuresSame(sourceDir, destDir)).toBe(true)
    expect(await areContentsSame(destDir, expectedDir)).toBe(true)
  }, 15000)

  describe('migrates as per the migrate options only', () => {
    it('can be configured to migrate only apollo client subscriptions', async () => {
      migrateProject(new Project(), {
        toMigrate: {
          restartSub: true,
          graphqlWs: false,
          stateSyncLink: false,
          inMemoryCache: false,
          makeVar: false,
        },
      })

      expect(spies['migrateApolloClientSubs']).toHaveBeenCalledTimes(1)
      expect(spies['migrateGqlWs']).not.toHaveBeenCalled()
      expect(spies['migrateInMemoryCache']).not.toHaveBeenCalled()
      expect(spies['migrateMakeVar']).not.toHaveBeenCalled()
    })

    it('can be configured to migrate only graphql-ws links', async () => {
      migrateProject(new Project(), {
        toMigrate: {
          restartSub: false,
          graphqlWs: true,
          stateSyncLink: false,
          inMemoryCache: false,
          makeVar: false,
        },
      })

      expect(spies['migrateApolloClientSubs']).not.toHaveBeenCalled()
      expect(spies['migrateGqlWs']).toHaveBeenCalledTimes(1)
      expect(spies['migrateInMemoryCache']).not.toHaveBeenCalled()
      expect(spies['migrateMakeVar']).not.toHaveBeenCalled()
    })

    it('can be configured to migrate only in-memory cache initializations.', async () => {
      migrateProject(new Project(), {
        toMigrate: {
          restartSub: false,
          graphqlWs: false,
          stateSyncLink: true,
          inMemoryCache: true,
          makeVar: false,
        },
      })

      expect(spies['migrateApolloClientSubs']).not.toHaveBeenCalled()
      expect(spies['migrateGqlWs']).not.toHaveBeenCalled()
      expect(spies['migrateInMemoryCache']).toHaveBeenCalledTimes(1)
      expect(spies['migrateMakeVar']).not.toHaveBeenCalled()
    })

    it('can be configured to migrate only makeVar calls.', async () => {
      migrateProject(new Project(), {
        toMigrate: {
          restartSub: false,
          graphqlWs: false,
          stateSyncLink: true,
          inMemoryCache: false,
          makeVar: true,
        },
      })

      expect(spies['migrateApolloClientSubs']).not.toHaveBeenCalled()
      expect(spies['migrateGqlWs']).not.toHaveBeenCalled()
      expect(spies['migrateInMemoryCache']).not.toHaveBeenCalled()
      expect(spies['migrateMakeVar']).toHaveBeenCalledTimes(1)
    })

    it('can be configured to migrate any subset of the migratable features.', async () => {
      migrateProject(new Project(), {
        toMigrate: {
          restartSub: true,
          graphqlWs: false,
          stateSyncLink: true,
          inMemoryCache: true,
          makeVar: false,
        },
      })

      expect(spies['migrateApolloClientSubs']).toHaveBeenCalledTimes(1)
      expect(spies['migrateGqlWs']).not.toHaveBeenCalled()
      expect(spies['migrateInMemoryCache']).toHaveBeenCalledTimes(1)
      expect(spies['migrateMakeVar']).not.toHaveBeenCalled()
    })
  })
})
test(`migration didn't accidentally edit its own source code itself.`, async () => {
  const currentValue = await fs.readFile(
    path.join(import.meta.dirname, './test-snapshot.ts')
  )
  expect(currentValue).toMatchSnapshot()
})
