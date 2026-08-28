import { test as base, expect } from '@playwright/test'
import { getLocators } from '../getLocators'
import { initPageFixtures } from '../util'

const test = initPageFixtures(base)

declare global {
  interface Window {
    /**
     * An unique id for each browser. This is injected by addInitScript.
     * Used to avoid collisions when running tests in parallel across browsers.
     */
    __PLAYWRIGHT_TEST_ID__: string
  }
}

test.describe('subscriptions', () => {
  test.beforeEach(async ({ page1, page2 }, testInfo) => {
    // Generate a unique ID using the parallel worker index and a timestamp
    const uniqueId = `worker-${testInfo.workerIndex}-${Date.now()}`

    // Inject the ID into the browser's window object before any script runs
    await Promise.all(
      [page1, page2].map((page) =>
        page.addInitScript((id) => {
          window.__PLAYWRIGHT_TEST_ID__ = id
        }, uniqueId)
      )
    )
    await Promise.all([page1.reload(), page2.reload()])
  })

  test('subscriptions should work when using shared workers.', async ({
    page1,
    page2,
    browserName,
  }) => {
    const locators = getLocators({
      pages: { page1, page2 },
      locators: {
        value: 'last-emitted-value',
        input: 'input-to-emit',
        emit: 'emit-to-subscribers',
      },
    })

    let prevValue: string
    let toEmit: string
    await test.step('emitting from first page should update both pages', async () => {
      prevValue = await locators.page1.value.innerText()
      await expect(locators.page2.value).toHaveText(prevValue)
      /**
       * This timeout is needed to avoid a race condition.
       * It is used to wait until graphql-ws connection is established.
       * Otherwise, the mutation will not emit to this page
       *    since this page had not subscribed yet.
       */
      await page1.waitForTimeout(100)
      if (browserName === 'firefox') {
        /**
         * Firefox takes more time to establish ws connection.
         */
        await page1.waitForTimeout(2000)
      }
      toEmit = 'lorem ipsum randomized.'
      await locators.page1.input.fill(toEmit)
      await locators.page1.emit.click()
      await expect(locators.page1.value).toHaveText(toEmit)
      await expect(locators.page2.value).toHaveText(toEmit)
    })

    await test.step('emitting from second page should update both pages', async () => {
      prevValue = toEmit
      toEmit = 'logging output'
      expect(toEmit).not.toBe(prevValue)
      await locators.page2.input.fill(toEmit)
      await locators.page2.emit.click()
      await expect(locators.page1.value).toHaveText(toEmit)
      await expect(locators.page2.value).toHaveText(toEmit)
    })
  })
})
