import { test as base, expect } from '@playwright/test'
import { getLocators } from '../getLocators'
import { mockServersForTest } from '../setupMockServer'
import { initPageFixtures, waitForDebounce } from '../util'

const test = initPageFixtures(base)

test.describe('queries, and mutations', () => {
  mockServersForTest(test)
  test('query operations', async ({ page1, page2 }) => {
    const locators = getLocators({
      pages: { page1, page2 },
      locators: {
        value: 'queriable-field-value',
        query: 'refetch-queriable',
      },
    })

    const initialValue: string = await locators.page1.value.innerText()
    await expect(locators.page2.value).toHaveText(initialValue)

    await test.step(`query made from page 1 should update both pages`, async () => {
      const prevValue: string = await locators.page1.value.innerText()
      await locators.page1.query.click()
      await expect(locators.page1.value).not.toHaveText(prevValue)
      await expect(locators.page2.value).toHaveText(
        await locators.page1.value.innerText()
      )
    })

    await test.step(`query made from page 2 should update both pages`, async () => {
      const prevValue = await locators.page1.value.innerText()
      await locators.page2.query.click()
      await waitForDebounce(page1)
      await expect(locators.page2.value).not.toHaveText(prevValue)
      await expect(locators.page1.value).toHaveText(
        await locators.page2.value.innerText()
      )
    })
  })

  test('mutation operations', async ({ page1, page2, context }) => {
    const locators = getLocators({
      pages: { page1, page2 },
      locators: {
        value: 'queried-mutable-field-value',
        input: 'mutation-input',
        mutate: 'mutate-mutable-field',
        query: 'refetch-mutable',
      },
    })

    const preValue = 'pre-value-1'
    await locators.page2.input.fill(preValue)
    await locators.page2.mutate.click()
    await locators.page2.query.click()

    await test.step('mutation made from page 1 should update both pages', async () => {
      const randomValue1 = 'random-value-1'
      // expect(await locators.page1.value.innerText()).not.toBe(randomValue1)
      await expect(locators.page1.value).not.toHaveText(randomValue1)

      await locators.page1.input.fill(randomValue1)
      await locators.page1.mutate.click()

      await expect(locators.page1.value).toHaveText(randomValue1)
      await expect(locators.page2.value).toHaveText(randomValue1)
    })

    await test.step('mutation made from page 2 should update both pages', async () => {
      const randomValue2 = 'random-value-2'

      await locators.page2.input.fill(randomValue2)
      await locators.page2.mutate.click()

      await expect(locators.page1.value).toHaveText(randomValue2)
      await expect(locators.page2.value).toHaveText(randomValue2)
    })
  })
})
