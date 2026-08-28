#!/usr/bin/env node

/**
 * @packageDocumentation
 * The cli application.
 * It can automatically migrate ts projects to use 'state-sync-cross-tab'.
 */
import { runCliApp } from '@packages/common-utils/cli-utils'

import { cliApp } from './cliApp'

runCliApp(cliApp)
