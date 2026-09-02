#!/usr/bin/env node

/**
 * @packageDocumentation
 * The cli application.
 * It can automatically migrate ts projects to use 'state-sync-cross-tab'.
 */
import { buildApplication, buildCommand } from '@stricli/core'

import {
  buildArgs,
  cliAppConfig,
  getCommandFunction,
  type MigrateOptionsType,
} from '@packages/migration'
import { typedObjectEntries } from 'ts-strict-utils'

type FlagsType = Pick<MigrateOptionsType, 'tsConfigFilePath'> &
  Pick<MigrateOptionsType['toMigrate'], 'graphqlWs' | 'restartSub'>

type PositionalsType = [string?]

const getMigrateOptionsFromFlags = (
  flags: FlagsType,
  positionals: PositionalsType
): MigrateOptionsType => {
  return {
    tsConfigFilePath: flags.tsConfigFilePath ?? './tsconfig.json',
    toMigrate: {
      inMemoryCache: false,
      makeVar: false,
      stateSyncLink: false,
      graphqlWs: flags.graphqlWs ?? false,
      restartSub: flags.restartSub ?? false,
    },
  }
}

/**
 *  The schema for the cli commands, arguments, flags, documentations and executions.
 */
const rootMainCommand = buildCommand<FlagsType, PositionalsType>({
  ...buildArgs,
  docs: {
    ...buildArgs.docs,
    brief: `CLI used to migrate ApolloClient TypeScript projects to apollo-shared-ws.`,
  },
  parameters: {
    flags: {
      tsConfigFilePath: {
        ...buildArgs.parameters.flags.tsConfigFilePath,
      },
      graphqlWs: {
        ...buildArgs.parameters.flags.graphqlWs,
        default: true,
      },
      restartSub: {
        ...buildArgs.parameters.flags.restartSub,
        default: true,
      },
    },
    aliases: {
      ...Object.fromEntries(
        typedObjectEntries(buildArgs.parameters.aliases ?? {}).filter(
          ([key, value]) =>
            value === 'tsConfigFilePath' ||
            value === 'graphqlWs' ||
            value === 'restartSub'
        )
      ),
    },
    positional: buildArgs.parameters.positional,
  },

  func: getCommandFunction(getMigrateOptionsFromFlags),
})

/**
 * The cli application.
 * It is exported in order to support testing.
 */
export const cliApp = buildApplication(rootMainCommand, {
  ...cliAppConfig,
  name: 'apollo-shared-ws.',
})
