#!/usr/bin/env node

/**
 * @packageDocumentation
 * The cli application.
 * It can automatically migrate ts projects to use shared graphql-ws connection.
 */

import { runCliApp } from '@packages/common-utils/cli-utils'
import { cliApp } from './cliApp'

runCliApp(cliApp)
