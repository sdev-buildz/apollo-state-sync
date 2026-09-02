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
const getMigrateOptionsFromFlags = (
  flags: FlagsType,
  positionals: PositionalsType
): MigrateOptionsType => {
  return {
    tsConfigFilePath: flags.tsConfigFilePath,
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
    brief: `CLI used to migrate ApolloClient TypeScript projects to apollo-state-sync.`,
    fullDescription: `Requires ts-morph to be installed.
  If you are using npm, run "npm i -g ts-morph".
  If you are using pnpm, run "pnpm add -g ts-morph".
`,
  },
  parameters: {
    flags: {
      tsConfigFilePath: {
        kind: 'parsed',
        parse: String,
        default: './tsconfig.json',
        brief: `Path to the tsconfig.json file of the project to be migrated.`,
      },
      inMemoryCache: {
        kind: 'boolean',
        default: true,
        brief: 'Whether to migrate InMemoryCache.',
      },
      makeVar: {
        kind: 'boolean',
        default: true,
        brief: 'Whether to migrate reactive variables.',
      },
      stateSyncLink: {
        kind: 'boolean',
        default: true,
        brief:
          'Whether to insert stateSyncLink to ApolloClient constructor parameter.',
      },
      graphqlWs: {
        kind: 'boolean',
        default: false,
        brief: 'Whether to migrate GraphQLWsLink ( WebSocket ).',
      },
      restartSub: {
        kind: 'boolean',
        default: false,
        brief: `Whether to migrate ApolloClient to enable 'Subscription.restart'.`,
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
          brief: `Path to the tsconfig.json file of the project to be migrated.`,
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
