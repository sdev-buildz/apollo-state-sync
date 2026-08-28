import { test as base, expect } from '@playwright/test'
import { getLocators } from '../getLocators'
import { mockServersForTest } from '../setupMockServer'
import { initPageFixtures } from '../util'

const test = initPageFixtures(base)
test.describe('errors', () => {
  mockServersForTest(test)

  test('GraphQL errors.', async ({ page1, page2 }) => {
    const locators = getLocators({
      pages: { page1, page2 },
      locators: {
        value: 'error-tester-error-message',
        emit: 'emit-error',
      },
    })

    await expect(locators.page2.value).toHaveText(
      await locators.page1.value.innerText()
    )

    await test.step(`GraphQL errors are sent through data.errors.`, async () => {
      await page1.waitForTimeout(1000)
      await locators.page1.emit.click()

      await expect(locators.page1.value).toContainText('Unexpected error')
    })

    await test.step(`GraphQL susbcription errors are sent to all the subscribing browsing context.`, async () => {
      await expect(locators.page2.value).toHaveText(
        await locators.page1.value.innerText()
      )
    })
  })

  test('connection errors are sent to useSubscription.Result.error.', async ({
    page1,
    page2,
  }) => {
    const locators = getLocators({
      // pages: { page1, page2 },
      pages: { page1 },
      locators: {
        value: 'conn-error-tester-error-name',
      },
    })

    await expect(locators.page1.value).toHaveText('CombinedGraphQLErrors')
    // await expect(locators.page2.value).toHaveText(
    //   await locators.page1.value.innerText()
    // )
  })
})
