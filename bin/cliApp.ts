#!/usr/bin/env node

/**
 * @packageDocumentation
 * The cli application.
 * It can automatically migrate ts projects to use 'state-sync-cross-tab'.
 */
import { buildApplication, buildCommand } from '@stricli/core'
import fs from 'node:fs'
import path from 'node:path'

import * as migration from '@packages/migration'
import { type MigrateOptionsType } from '@packages/migration'

type FlagsType = Partial<Pick<MigrateOptionsType, 'tsConfigFilePath'>> &
  MigrateOptionsType['toMigrate']

type PositionalsType = [string?]

const getMigrateOptionsFromFlags = (
  flags: FlagsType,
  positionals: PositionalsType
): MigrateOptionsType => {
  return {
    tsConfigFilePath: flags.tsConfigFilePath ?? './tsconfig.json',
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
 *  The schema for the cli commands, arguments, flags, documentations and executions.
 */
const rootMainCommand = buildCommand<FlagsType, PositionalsType>({
  docs: {
    brief: 'A simple command-line interface for item inventory.',
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
        optional: true,
        brief: `Path to the tsconfig.json file of the project to be migrated.`,
      },
      inMemoryCache: {
        kind: 'boolean',
        default: true,
        brief: 'Whether to migrate the InMemoryCache to sync its state.',
      },
      makeVar: {
        kind: 'boolean',
        default: true,
        brief:
          'Whether to migrate the reactive variables to sync their states.',
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
        brief: 'Whether to migrate graphq-ws to use a shared connection.',
      },
      restartSub: {
        kind: 'boolean',
        default: false,
        brief: `Whether to migrate Apollo Client to support 'restart subscription' when using shared ws connection.`,
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
          brief: `Path to the project's tsconfig.json file.`,
        },
      ],
    },
  },

  func(flags: FlagsType, ...positionals) {
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
        targetPackage.name === 'ts-helpers-1234'
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
    const migrateOptions = getMigrateOptionsFromFlags(flags, positionals)
    migration.migrate(migrateOptions)
  },
})

/**
 * The cli application.
 * It is exported in order to support testing.
 */
export const cliApp = buildApplication(rootMainCommand, {
  name: 'migrate cli',
  versionInfo: {
    currentVersion: `v1.0.0`,
  },
  scanner: {
    caseStyle: 'allow-kebab-for-camel',
  },
  documentation: {
    useAliasInUsageLine: true,
  },
})
