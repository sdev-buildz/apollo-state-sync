import type { ApolloClient, InMemoryCache, makeVar } from '@apollo/client'
import type { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { Project, QuoteKind } from 'ts-morph'
import type { StrictOmit } from 'ts-strict-utils'
import { SemicolonPreference } from 'typescript'
import { executeBatches } from './lib/batchManipulationOperations'
import { migrateStateSyncLink } from './migStateSyncLinks'
import { migrateApolloClientSubs } from './migrateApolloClientSubs'
import { migrateGqlWs } from './migrateGqlWs'
import { migrateInMemoryCache } from './migrateInMemoryCache'
import { migrateMakeVar } from './migrateMakeVar'

/**
 * Migrates all the files in ts-morph project.
 */
export const migrateProject = (
  project: Project,
  migrateOptions: StrictOmit<MigrateOptionsType, 'tsConfigFilePath'>
) => {
  project.manipulationSettings.set({
    quoteKind: QuoteKind.Single,
  })
  if (migrateOptions.toMigrate.inMemoryCache === true)
    migrateInMemoryCache(project)

  if (migrateOptions.toMigrate.makeVar === true) migrateMakeVar(project)

  if (migrateOptions.toMigrate.stateSyncLink === true)
    migrateStateSyncLink(project)

  if (migrateOptions.toMigrate.graphqlWs === true) migrateGqlWs(project)

  if (migrateOptions.toMigrate.restartSub === true)
    migrateApolloClientSubs(project)
  executeBatches()

  for (const file of project.getSourceFiles()) {
    if (file.isSaved()) continue

    const fileExtension = file.getExtension()
    if (
      fileExtension === '.ts' ||
      fileExtension === '.tsx' ||
      fileExtension === '.mts' ||
      fileExtension === '.cts'
    ) {
      file.organizeImports()
    }
    file.formatText({
      semicolons: SemicolonPreference.Remove,
      indentSize: 2,
    })
  }

  return project.save()
}

/**
 * The config options for the {@link migrate} function.
 */
export type MigrateOptionsType = {
  /**
   * Path to the project's tsconfig.json file.
   * Used when initalizing ts-morph {@link Project}.
   * For more information: https://ts-morph.com/setup/
   */
  tsConfigFilePath: string
  /**
   * Flags to specify which syntaxes or APIs are to be migrated.
   */
  toMigrate: {
    /**
     * Whether to migrate {@link InMemoryCache}.
     */
    inMemoryCache: boolean
    /**
     * Whether to migrate {@link makeVar} function calls to sync reactive variables.
     */
    makeVar: boolean
    /**
     * Whether to migrate to state sync links.
     * This is recommended to be true when migrating in-memory cache or reactive variables.
     */
    stateSyncLink: boolean
    /**
     * Whether to migrate {@link GraphQLWsLink} instances to GraphQLSharedWsLink instances.
     */
    graphqlWs: boolean
    /**
     * Whether to migrate {@link ApolloClient} instializations with 'setup restart subscriptions'.
     */
    restartSub: boolean
  }
}

/**
 * Migrates the project to use 'state-sync-cross-tab'.
 */
export const migrate = (migrateOptions: MigrateOptionsType) => {
  const project = new Project({
    tsConfigFilePath: migrateOptions.tsConfigFilePath,
  })
  return migrateProject(project, migrateOptions)
}
