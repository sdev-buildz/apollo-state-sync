import type {
  BaseArgs,
  BaseFlags,
  buildApplication,
  buildCommand,
  CommandContext,
  CommandFunction,
} from '@stricli/core'
import fs from 'node:fs'
import path from 'node:path'
import type { StrictOmit } from 'ts-strict-utils'
import { migrate, type MigrateOptionsType } from './migrate'

/**
 * cli flags type.
 */
export type FlagsType = Pick<MigrateOptionsType, 'tsConfigFilePath'> &
  MigrateOptionsType['toMigrate']

/**
 * cli positional arguments type.
 */
export type PositionalsType = [string?]

/**
 *  Provides the migrate options from input flags.
 */
export const getMigrateOptionsFromFlags = (
  flags: Partial<Pick<FlagsType, 'tsConfigFilePath'>> &
    StrictOmit<FlagsType, 'tsConfigFilePath'>,
  positionals: PositionalsType
): MigrateOptionsType => {
  return {
    tsConfigFilePath: (flags.tsConfigFilePath ?? positionals[0])!,
    toMigrate: {
      inMemoryCache: flags.inMemoryCache,
      makeVar: flags.makeVar,
      stateSyncLink: flags.stateSyncLink,
      graphqlWs: flags.graphqlWs,
      restartSub: flags.restartSub,
    },
  }
}

/**
 * @returns the command function for the cli command.
 */
export const getCommandFunction = <
  FlagsT extends BaseFlags = FlagsType,
  PositionalsT extends BaseArgs = PositionalsType,
  CommandContextT extends CommandContext = CommandContext,
>(
  getOptionsFromFlags: typeof getMigrateOptionsFromFlags = getMigrateOptionsFromFlags
): CommandFunction<FlagsT, PositionalsT, CommandContextT> => {
  return (flags: FlagsT, ...positionals) => {
    const targetPackagePath = path.join(process.cwd(), 'package.json')
    /**
     * Check if the current project is the cli itself.
     */
    if (fs.existsSync(targetPackagePath)) {
      const targetPackage = JSON.parse(
        fs.readFileSync(targetPackagePath, 'utf-8') ?? '{}'
      )
      if (
        targetPackage.name === 'apollo-state-sync' ||
        targetPackage.name === 'apollo-shared-ws'
      ) {
        if (
          process.env.NODE_ENV !== 'test' ||
          process.env.CLI_EXEC_TEST === 'true'
        ) {
          console.warn(
            `
            Since this project folder is the source code of the cli itself, the cli is not executed.
            If you want to try using the cli, invoke the cli command in a different proejct.
            `
          )
          return
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const migrateOptions = getOptionsFromFlags(flags as any, positionals as any)

    migrate(migrateOptions)
  }
}

/**
 * cli command config.
 */
export const buildArgs = {
  docs: {
    brief: `CLI for migrating Apollo Client TypeScript projects to apollo-state-sync.`,
    fullDescription: `Requires ts-morph to be installed.
  If you are using npm, run "npm i --save-dev ts-morph".
  If you are using pnpm, run "pnpm add --save-dev ts-morph".
`,
  },
  parameters: {
    flags: {
      tsConfigFilePath: {
        kind: 'parsed',
        parse: String,
        default: './tsconfig.json',
        brief: `Path to the tsconfig.json file of the project to migrate.`,
      },
      inMemoryCache: {
        kind: 'boolean',
        default: true,
        brief: 'Migrate Apollo InMemoryCache usage.',
      },
      makeVar: {
        kind: 'boolean',
        default: true,
        brief: 'Migrate reactive variables created with makeVar.',
      },
      stateSyncLink: {
        kind: 'boolean',
        default: true,
        brief: 'Insert stateSyncLink into the ApolloClient constructor.',
      },
      graphqlWs: {
        kind: 'boolean',
        default: false,
        brief: 'Migrate GraphQL-WS clients to GraphQL-Shared-WS.',
      },
      restartSub: {
        kind: 'boolean',
        default: false,
        brief: `Migrate ApolloClient to enable Subscription.restart.`,
      },
    },
    aliases: {
      t: 'tsConfigFilePath',
      p: 'tsConfigFilePath',
      i: 'inMemoryCache',
      m: 'makeVar',
      w: 'graphqlWs',
      a: 'restartSub',
    },
    positional: {
      kind: 'tuple',
      parameters: [
        {
          placeholder: 'tsConfigFilePath',
          optional: true,
          parse: String,
          default: './tsconfig.json',
          brief: `Path to the tsconfig.json file of the project to migrate.`,
        },
      ],
    },
  },

  func: getCommandFunction(),
} as const satisfies Parameters<
  typeof buildCommand<FlagsType, PositionalsType>
>[0]

/**
 * cli app config.
 */
export const cliAppConfig: Parameters<typeof buildApplication>[1] = {
  name: 'apollo-state-sync',
  versionInfo: {
    currentVersion: `v1.0.0`,
  },
  scanner: {
    caseStyle: 'allow-kebab-for-camel',
  },
  documentation: {
    useAliasInUsageLine: true,
  },
}
