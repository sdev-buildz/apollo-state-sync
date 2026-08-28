#!/usr/bin/env node

/**
 * @packageDocumentation
 * The cli application.
 * It can automatically migrate ts projects to use 'state-sync-cross-tab'.
 */
import { run, type Application, type CommandContext } from '@stricli/core'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import type { LocalContext } from './LocalContext'

/**
 * Runs the given cli app.
 */
export const runCliApp = (cliApp: Application<CommandContext>) => {
  return run(cliApp, process.argv.slice(2), {
    process,
    os,
    fs,
    path,
  } as LocalContext)
}
