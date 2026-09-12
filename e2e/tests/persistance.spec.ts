import {
  test as base,
  expect,
  type BrowserContext,
  type Page,
} from '@playwright/test'
import { getLocators } from '../getLocators'
import { fulfillUsingMockServer } from '../setupMockServer'
import { waitForDebounce } from '../util'

/** The number of grpahql requests sent to the server. */
type GqlRequestsCountsType = {
  page1: number
  page2: number
  page3: number
  /** The count before the last page reload. */
  prev: {
    page1: number
    page2: number
    page3: number
  }
}

/**
 * Initializes Page fixtures.
 * Creates pages under same context and navigates both to localhost:3000.
 */
const initFixturesForPersistanceTest = (baseParam: typeof base) => {
  return baseParam.extend<{
    pageFixtures: {
      page1: Page
      page2: Page
      page3: Page
      context: BrowserContext
      gqlRequestsCounts: GqlRequestsCountsType
    }
  }>({
    pageFixtures: async ({ browser, page }, use) => {
      const context = await browser.newContext()
      const page1 = await context.newPage()
      const page2 = await context.newPage()
      const page3 = await context.newPage()
      await page1.clock.install()
      await page2.clock.install()
      await page3.clock.install()

      /**
       * To track the number of GraphQL API requests sent to the server.
       */
      const gqlRequestsCounts: GqlRequestsCountsType = {
        page1: 0,
        page2: 0,
        page3: 0,
        /** The count before the last page reload. */
        prev: {
          page1: 0,
          page2: 0,
          page3: 0,
        },
      }

      // 1. Intercept network requests to track hits to your API endpoint
      await page1.route('**/graphql', async (route) => {
        gqlRequestsCounts.page1 += 1
        await fulfillUsingMockServer(route)
      })
      await page2.route('**/graphql', async (route) => {
        gqlRequestsCounts.page2 += 1
        await fulfillUsingMockServer(route)
      })
      await page3.route('**/graphql', async (route) => {
        gqlRequestsCounts.page3 += 1
        await fulfillUsingMockServer(route)
      })
      const pageFixtures = {
        page1,
        page2,
        page3,
        context,
        gqlRequestsCounts,
      }
      await use(pageFixtures)
    },
  })
}

const test = initFixturesForPersistanceTest(base)

test.describe('persistance', () => {
  test('in-memory cache should be persisted and reused.', async ({
    pageFixtures: { page1, page2, page3, context, gqlRequestsCounts },
  }) => {
    const locators = getLocators({
      pages: { page1, page2, page3 },
      locators: {
        queriedValue: 'queriable-field-value',
        rvarInput: 'input-str-rvar-1',
        rvarUpdate: 'update-str-rvar-1',
        rvarValue: 'str-rvar-1-value',
      },
    })
    let queriedValue: string

    await test.step('Initial page load should request api server', async () => {
      await page1.goto('/')
      await waitForDebounce(page1)

      expect(gqlRequestsCounts.page1).toBeGreaterThan(
        gqlRequestsCounts.prev.page1
      )
      gqlRequestsCounts.prev.page1 = gqlRequestsCounts.page1
      queriedValue = await locators.page1.queriedValue.innerText()
    })
    const newRvarValue = 'lorem ipsum'

    await test.step('setting reactive variable ', async () => {
      await expect(locators.page1.rvarValue).not.toHaveText(newRvarValue)
      await locators.page1.rvarInput.fill(newRvarValue)
      await locators.page1.rvarUpdate.click()

      await expect(locators.page1.rvarValue).toHaveText(newRvarValue)
    })

    await test.step('Subsequent page reloads should use cached data and should skip api requests.', async () => {
      await page1.reload()
      await waitForDebounce(page1)

      test.step('no network requests should have been made because all the data are restored from persistant storage', () => {
        expect(gqlRequestsCounts.page1).toBe(gqlRequestsCounts.prev.page1)
      })

      await expect(locators.page1.queriedValue).toHaveText(queriedValue)
      await expect(locators.page1.rvarValue).toHaveText(newRvarValue)
    })

    await test.step('Opening multiple browser tabs, should use cached data and should skip api requests', async () => {
      await page2.goto('/')
      await waitForDebounce(page1)

      test.step('no network requests should have been made because all the data are restored from persistant storage', () => {
        expect(gqlRequestsCounts.page2).toBe(gqlRequestsCounts.prev.page2)
      })

      await expect(locators.page2.queriedValue).toHaveText(queriedValue)
      await expect(locators.page2.rvarValue).toHaveText(newRvarValue)
    })

    await test.step('Closing all the browser tabs and reopening, should use cached data and should skip api requests', async () => {
      await Promise.all([page1.close(), page2.close()])
      await page3.goto('/')
      await waitForDebounce(page3)

      test.step('no network requests should have been made because all the data are restored from persistant storage', () => {
        expect(gqlRequestsCounts.page3).toBe(gqlRequestsCounts.prev.page3)
      })

      await expect(locators.page3.queriedValue).toHaveText(queriedValue)
      await expect(locators.page3.rvarValue).toHaveText(newRvarValue)
    })

    await test.step('Expired cache should not be restored.', async () => {
      await page3.clock.fastForward(1000 * 60 * 60 * 4)

      await page3.reload()

      await expect(locators.page3.queriedValue).not.toHaveText(queriedValue)
      await expect(locators.page3.rvarValue).not.toHaveText(newRvarValue)

      expect(gqlRequestsCounts.page3).toBeGreaterThan(
        gqlRequestsCounts.prev.page3
      )
    })
  })
})
