#!/usr/bin/env node

/**
 * @packageDocumentation
 * The cli application.
 * It can automatically migrate ts projects to use 'state-sync-cross-tab'.
 */
import {
  buildArgs,
  cliAppConfig,
  type FlagsType,
  type PositionalsType,
} from '@packages/migration'
import { buildApplication, buildCommand } from '@stricli/core'

/**
 *  The schema for the cli commands, arguments, flags, documentations and executions.
 */
const rootMainCommand = buildCommand<FlagsType, PositionalsType>(buildArgs)

/**
 * The cli application.
 * It is exported in order to support testing.
 */
export const cliApp = buildApplication(rootMainCommand, {
  ...cliAppConfig,
  name: 'cli to migrate to apollo-state-sync.',
})
