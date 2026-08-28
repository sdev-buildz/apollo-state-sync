import type { run } from '@stricli/core'

/**
 * Provides context object for the cli application for testing.
 */
export function buildContextForTest(): Parameters<typeof run>[2] {
  return {
    process: {
      stderr: {
        write: () => {},
      },
      stdout: {
        write: () => {},
      },
    },
  }
}
