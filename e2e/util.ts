import type test from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * Initializes Page fixtures.
 * Creates pages under same context and navigates both to localhost:3000.
 */
export const initPageFixtures = (
  base: typeof test,
  initScript?: () => void
) => {
  return base.extend<{ page1: Page; page2: Page }>({
    page1: async ({ context }, use) => {
      const page1 = await context.newPage()
      if (initScript) await page1.addInitScript(initScript)
      await page1.goto('/')
      await page1.clock.install()
      await use(page1)
    },
    page2: async ({ context }, use) => {
      const page2 = await context.newPage()
      if (initScript) await page2.addInitScript(initScript)
      await page2.goto('/')
      await page2.clock.install()
      await use(page2)
    },
  })
}

/**
 * waits for state synchronization debounce.
 */
export const waitForDebounce = async (page: Page) => {
  await page.clock.fastForward(40)
  // await page.clock.fastForward(synchronizationDebouncer.timeoutms)
}
