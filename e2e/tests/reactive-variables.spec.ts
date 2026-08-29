import { test as base, expect } from '@playwright/test'
import { canonicalSerialization, deserialize } from 'canonical-serialization'
import { getLocators } from '../getLocators'
import { mockServersForTest } from '../setupMockServer'
import { initPageFixtures } from '../util'
import type { ReactiveVarTestElementType } from '../web-app/web-client/components/TestingPanel/ReactiveVarTest'

const test = initPageFixtures(base)

test.describe('reactive variables', () => {
  mockServersForTest(test)
  test('a single reactive variable holding immutable values', async ({
    page1,
    page2,
  }) => {
    const locators = getLocators({
      pages: { page1, page2 },
      locators: {
        value: 'str-rvar-1-value',
        input: 'input-str-rvar-1',
        update: 'update-str-rvar-1',
      },
    })

    await test.step('updating reactive variable in page 1, should update in page 2', async (step) => {
      const newValue = 'randomized characters'
      const prevValue = await locators.page1.value.innerText()
      await expect(locators.page2.value).toHaveText(prevValue)

      await locators.page1.input.fill(newValue)
      await locators.page1.update.click()

      await expect(locators.page1.value).toHaveText(newValue)
      await expect(locators.page2.value).toHaveText(newValue)
    })

    await test.step('updating reactive variable in page 2, should update in page 1', async (step) => {
      const newValue = 'lorem ipsum'
      const prevValue = await locators.page2.value.innerText()
      await expect(locators.page1.value).toHaveText(prevValue)

      await locators.page2.input.fill(newValue)
      await locators.page2.update.click()

      await expect(locators.page1.value).toHaveText(newValue)
      await expect(locators.page2.value).toHaveText(newValue)
    })
  })

  test('reactive variables with immutable values', async ({ page1, page2 }) => {
    const locators = getLocators({
      pages: { page1, page2 },
      locators: {
        // The pages have 2 reactive variables.
        value1: 'str-rvar-1-value',
        value2: 'str-rvar-2-value',

        input: 'input-str-rvar-1',
        update1: 'update-str-rvar-1',
        update2: 'update-str-rvar-2',
      },
    })

    const prevValue1 = await locators.page1.value1.innerText()
    const prevValue2 = await locators.page1.value2.innerText()

    expect(prevValue1).not.toBe(prevValue2)
    await expect(locators.page2.value1).toHaveText(prevValue1)
    await expect(locators.page2.value2).toHaveText(prevValue2)

    await test.step('updating 1st reactive variable in page 2', async (step) => {
      const newValue1 = 'new value'
      expect(newValue1).not.toBe(prevValue1)
      await locators.page2.input.fill(newValue1)
      await locators.page2.update1.click()

      await test.step('The 1st reactive variable should have been updated', async () => {
        await expect(locators.page1.value1).toHaveText(newValue1)
        await expect(locators.page2.value1).toHaveText(newValue1)
      })

      await test.step('The 2nd reactive variable should not be updated', async () => {
        await expect(locators.page1.value2).toHaveText(prevValue2)
        await expect(locators.page2.value2).toHaveText(prevValue2)
      })
    })

    await test.step('updating 1st reactive variable in page 1', async (step) => {
      const prevValue1 = await locators.page1.value1.innerText()
      const newValue1 = 'another value'
      expect(newValue1).not.toBe(prevValue1)
      await locators.page1.input.fill(newValue1)
      await locators.page1.update1.click()

      await test.step('The 1st reactive variable should have been updated', async () => {
        await expect(locators.page1.value1).toHaveText(newValue1)
        await expect(locators.page2.value1).toHaveText(newValue1)
      })

      await test.step('The 2nd reactive variable should not be updated', async () => {
        await expect(locators.page1.value2).toHaveText(prevValue2)
        await expect(locators.page2.value2).toHaveText(prevValue2)
      })
    })

    await test.step('updating 2nd reactive variable in page 1', async (step) => {
      const prevValue1 = await locators.page1.value1.innerText()
      const newValue2 = 'randomized characters'
      expect(newValue2).not.toBe(prevValue2)
      await locators.page1.input.fill(newValue2)
      await locators.page1.update2.click()

      await test.step('The 2nd reactive variable should have been updated', async () => {
        await expect(locators.page1.value2).toHaveText(newValue2)
        await expect(locators.page2.value2).toHaveText(newValue2)
      })

      await test.step('The 2nd reactive variable should not have been updated', async () => {
        await expect(locators.page1.value1).toHaveText(prevValue1)
        await expect(locators.page2.value1).toHaveText(prevValue1)
      })
    })

    await test.step('updating 2nd reactive variable when both the variables have same value.', async (step) => {
      // pre conditions
      const commonValue = 'lorem ipsum'

      await locators.page1.input.fill(commonValue)
      await locators.page1.input.fill(commonValue)
      await locators.page1.update1.click()
      await locators.page1.update2.click()

      await expect(locators.page1.value1).toHaveText(commonValue)
      await expect(locators.page2.value1).toHaveText(commonValue)
      await expect(locators.page1.value2).toHaveText(commonValue)
      await expect(locators.page2.value2).toHaveText(commonValue)

      // update 2nd reactive variable
      const prevValue1 = await locators.page1.value1.innerText()
      const prevValue2 = await locators.page1.value2.innerText()
      const newValue2 = 'updated variable'
      expect(newValue2).not.toBe(prevValue2)
      await locators.page2.input.fill(newValue2)
      await locators.page2.update2.click()

      await test.step('The 2nd reactive variable should have been updated', async () => {
        await expect(locators.page1.value2).toHaveText(newValue2)
        await expect(locators.page2.value2).toHaveText(newValue2)
      })

      await test.step('The 1st reactive variable should not have been updated', async () => {
        await expect(locators.page1.value1).toHaveText(prevValue1)
        await expect(locators.page2.value1).toHaveText(prevValue1)
      })
    })
  })

  test('reactive variables with mutable values', async ({ page1, page2 }) => {
    const locators = getLocators({
      pages: { page1, page2 },
      locators: {
        // The pages have 2 reactive variables.
        value: 'reactive-variable-list-1-value',
        inputText: 'reactive-variable-list-input-text',
        inputNumber: 'reactive-variable-list-input-number',
      },
    })
    const addInPage1 = page1.getByTestId('add-to-list-reactive-variable-1')
    const addInPage2 = page2.getByTestId('add-to-list-reactive-variable-1')

    const list: ReactiveVarTestElementType = deserialize(
      await locators.page1.value.innerText()
    ) as ReactiveVarTestElementType
    // Initial state check
    await expect(locators.page2.value).toHaveText(canonicalSerialization(list))

    // Add new element
    let newElement: ReactiveVarTestElementType[number] = {
      stringValue: 'a test string',
      numberValue: 3,
    }
    list.push(newElement)
    await locators.page1.inputText.fill(newElement.stringValue)
    await locators.page1.inputNumber.fill(newElement.numberValue.toString())
    await addInPage1.click()

    // Check new element
    await expect(locators.page1.value).toHaveText(canonicalSerialization(list))
    await page1.waitForTimeout(500)
    await expect(locators.page2.value).toHaveText(canonicalSerialization(list))

    // Add another element
    newElement = {
      stringValue: 'another test string',
      numberValue: 123,
    }
    list.push(newElement)
    await locators.page2.inputText.fill(newElement.stringValue)
    await locators.page2.inputNumber.fill(newElement.numberValue.toString())
    await addInPage2.click()

    // Check another element
    await expect(locators.page2.value).toHaveText(canonicalSerialization(list))
    await expect(locators.page1.value).toHaveText(canonicalSerialization(list))
  })

  test('reactive variables having functions', async ({ page1, page2 }) => {
    const locators = getLocators({
      pages: { page1, page2 },
      locators: {
        value: 'function-reactive-var-value',
        setToFun1: 'set-function-reactive-var-to-first',
        setToFun2: 'set-function-reactive-var-to-second',
      },
    })

    const prevValue = await locators.page1.value.innerText()
    await expect(locators.page2.value).toHaveText(prevValue)

    await locators.page1.setToFun2.click()

    await expect(locators.page1.value).not.toHaveText(prevValue)
    await expect(locators.page2.value).toHaveText(
      await locators.page1.value.innerText()
    )

    const fun = deserialize(await locators.page1.value.innerText())
    test.fail(!(typeof fun === 'function'))
  })
})
