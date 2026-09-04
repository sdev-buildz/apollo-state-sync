import { useReactiveVar } from '@apollo/client/react'
import { makeVarSynced } from 'apollo-state-sync'
import { canonicalSerialization } from 'canonical-serialization'
import { useState } from 'react'

type ElementType = {
  stringValue: string
  numberValue: number
}
const initialValue1: ElementType[] = [
  {
    stringValue: 'text1',
    numberValue: 111,
  },
  {
    stringValue: 'sample',
    numberValue: 222,
  },
]
const initialValue2: ElementType[] = [
  {
    stringValue: 'random-text-1121',
    numberValue: 43,
  },
  {
    stringValue: 'characters',
    numberValue: 54,
  },
]
/**
 * The type of the reactive variable element type for testing
 */
export type ReactiveVarTestElementType = ElementType[]

const reactiveVarList1 = makeVarSynced(initialValue1, 'reactiveVar1ForTest')
const reactiveVarList2 = makeVarSynced<ReactiveVarTestElementType>(
  initialValue2,
  'reactiveVar2ForTest'
)

const sampleFunction1 = () => {
  const a = 'b'
  return `b${a}cd` as const
}

const sampleFunction2 = (): Exclude<
  string,
  ReturnType<typeof sampleFunction1>
> => {
  const a = 'c'
  return `n${a}cde`
}

/**
 * Has a function as value.
 */
const functionReactiveVar = makeVarSynced<() => string | number>(
  sampleFunction1,
  'sampleFunctionForTest'
)

const rVarStr2 = makeVarSynced('second-text', 'rVarStr2')
const rVarStr1 = makeVarSynced('first-string', 'rVarStr1')

/**
 * All the products available
 */
export const ReactiveVarTest = () => {
  const rVarListHooked1 = useReactiveVar<ReactiveVarTestElementType>(
    reactiveVarList1 as unknown as Parameters<
      typeof useReactiveVar<ReactiveVarTestElementType>
    >[0]
  )
  const rVarListHooked2 = useReactiveVar<ReactiveVarTestElementType>(
    reactiveVarList2 as unknown as Parameters<
      typeof useReactiveVar<ReactiveVarTestElementType>
    >[0]
  )
  const rVarStr1Hooked = useReactiveVar<string>(
    rVarStr1 as unknown as Parameters<typeof useReactiveVar<string>>[0]
  )
  const rVarStr2Hooked = useReactiveVar<string>(
    rVarStr2 as unknown as Parameters<typeof useReactiveVar<string>>[0]
  )
  const functionVar = useReactiveVar(
    functionReactiveVar as unknown as Parameters<typeof useReactiveVar>[0]
  )

  const [inputString, setInputString] = useState('a string')

  const [inputListText, setInputListText] = useState('a random string')
  const [inputListNumber, setInputListNumber] = useState(2)

  return (
    <section className='reactive-vars'>
      <h4>Reactive Variables Tester</h4>

      {/* Reactive variables with immutable values */}
      <section id='has-string'>
        <div data-testid='str-rvar-1-value'>{rVarStr1Hooked}</div>
        <div data-testid='str-rvar-2-value'>{rVarStr2Hooked}</div>
        <label htmlFor='input-str-rvar-1'>String to set to:</label>
        <input
          id='input-str-rvar-1'
          data-testid='input-str-rvar-1'
          type='text'
          value={inputString}
          onChange={(e) => setInputString(e.target.value)}
        ></input>
        <button
          data-testid='update-str-rvar-1'
          type='button'
          onClick={() => {
            rVarStr1(inputString)
          }}
        >
          Set the first string reactive var
        </button>
        <button
          data-testid='update-str-rvar-2'
          type='button'
          onClick={() => {
            rVarStr2(inputString)
          }}
        >
          Set the second string reactive var
        </button>
      </section>

      {/* Reactive variables with mutable values */}
      <section id='has-list-of-objects'>
        <label htmlFor='input-obj-text'>String to add to the list:</label>
        <input
          id='input-obj-text'
          data-testid='reactive-variable-list-input-text'
          type='text'
          value={inputListText}
          onChange={(e) => setInputListText(e.target.value)}
        ></input>
        <br />
        <label htmlFor='input-obj-number'>Number to add to the list:</label>
        <input
          id='input-obj-number'
          data-testid='reactive-variable-list-input-number'
          type='number'
          value={inputListNumber}
          onChange={(e) => setInputListNumber(parseInt(e.target.value))}
        ></input>
        <br />
        <button
          type='button'
          data-testid='add-to-list-reactive-variable-1'
          onClick={() =>
            reactiveVarList1([
              ...rVarListHooked1,
              { numberValue: inputListNumber, stringValue: inputListText },
            ])
          }
        >
          Add To first list
        </button>
        <button
          type='button'
          data-testid='add-to-list-reactive-variable-2'
          onClick={() =>
            reactiveVarList2([
              ...rVarListHooked2,
              { numberValue: inputListNumber, stringValue: inputListText },
            ])
          }
        >
          Add To second list
        </button>
        <button
          type='button'
          onClick={() => {
            reactiveVarList1(initialValue1)
            reactiveVarList2(initialValue2)
          }}
        >
          Reset
        </button>
        <ul id='rvar-1-list'>
          {rVarListHooked1.map((element, index) => (
            <li key={index}>
              <dl>
                <dt>{element.stringValue}</dt>
                <dd>{element.numberValue}</dd>1
              </dl>
            </li>
          ))}
        </ul>
        <ul id='rvar-2-list'>
          {rVarListHooked2.map((element, index) => (
            <li key={index}>
              <dl>
                <dt>{element.stringValue}</dt>
                <dd>{element.numberValue}</dd>
              </dl>
            </li>
          ))}
        </ul>
        <p data-testid='reactive-variable-list-1-value'>
          {canonicalSerialization(rVarListHooked1)}
        </p>
        <p data-testid='reactive-variable-list-2-value'>
          {canonicalSerialization(rVarListHooked2)}
        </p>
      </section>

      {/* Reactive variables with non-serializable values. (functions) */}
      <section id='has-function'>
        <dl>
          <dt>Function in reactive variable =</dt>
          <dd data-testid='function-reactive-var-value'>
            {canonicalSerialization(functionVar)}
          </dd>
        </dl>
        <button
          data-testid='set-function-reactive-var-to-first'
          type='button'
          onClick={() => functionReactiveVar(sampleFunction1)}
        >
          Set Function 1
        </button>
        <button
          data-testid='set-function-reactive-var-to-second'
          type='button'
          onClick={() => functionReactiveVar(sampleFunction2)}
        >
          Set Function 2
        </button>
      </section>
    </section>
  )
}
