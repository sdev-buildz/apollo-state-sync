import type { StricliAutoCompleteContext } from '@stricli/auto-complete'
import type { CommandContext } from '@stricli/core'
import type { promises } from 'node:fs'
import type path from 'node:path'

/**
 * The context of the cli application.
 */
export interface LocalContext
  extends CommandContext, StricliAutoCompleteContext {
  readonly process: StricliAutoCompleteContext['process'] & {
    readonly cwd: () => string
    readonly versions?: { readonly node?: string }
  }
  readonly fs: {
    readonly promises: Pick<typeof promises, 'readFile' | 'writeFile' | 'mkdir'>
  }
  readonly path: Pick<typeof path, 'join' | 'basename'>
}
