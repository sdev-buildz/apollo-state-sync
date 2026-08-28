import { gql, type TypedDocumentNode } from '@apollo/client'
import { useMutation, useSubscription } from '@apollo/client/react'
import type {
  Mutation,
  Subscription,
  SubscriptionSubscribeToEmittedStringArgs,
} from '@types-gen-react-apollo'
import { useRef, useState } from 'react'

declare global {
  interface Window {
    /**
     * An unique id for each browser. This is injected by Playwright addInitScript.
     * Used to avoid collisions when running tests in parallel across browsers.
     */
    __PLAYWRIGHT_TEST_ID__: string
  }
}

/**
 * To test subscription type operations
 */
export const SubscriptionTest = () => {
  // An unique id for the browser in playwright.
  const uniqueIdRef = useRef(`${window.__PLAYWRIGHT_TEST_ID__}-normal`)
  const [value, setValue] = useState<string>('')
  const res = useSubscription(
    gql`
      subscription subscribable($browserId: String!) {
        subscribeToEmittedString(browserId: $browserId)
      }
    ` as TypedDocumentNode<
      Pick<Subscription, 'subscribeToEmittedString'>,
      SubscriptionSubscribeToEmittedStringArgs
    >,
    {
      variables: {
        browserId: (window.__PLAYWRIGHT_TEST_ID__ ?? '') + '-normal',
      },

      onData: ({ data: { data } }) => {
        const [value, emitterId] =
          data?.subscribeToEmittedString?.split('_id_') ?? []
        if (emitterId !== uniqueIdRef.current) return
        setValue(() => value ?? '')
      },
    }
  )
  const [inputToEmit, setInputToEmit] = useState(`a random text`)
  const [emitToSubscribers] = useMutation(
    gql`
      mutation emit($value: String!) {
        emitString(value: $value)
      }
    ` as TypedDocumentNode<Pick<Mutation, 'emitString'>>
  )

  return (
    <section className='subscription-operation'>
      {String(res.loading)}
      <h4>Subscription Test</h4>
      {/* To test subscription type operations */}
      <dl>
        <dt>Subscribed Emitter. Last emitted:</dt>
        <dd data-testid={`last-emitted-value`}>{value}</dd>
      </dl>

      <label htmlFor={`input-to-emit`}>Text to emit:</label>
      <input
        id={`input-to-emit`}
        data-testid={`input-to-emit`}
        type='text'
        value={inputToEmit}
        onChange={(e) => setInputToEmit(e.target.value)}
      />
      <button
        data-testid={`emit-to-subscribers`}
        type='button'
        onClick={() => {
          emitToSubscribers({
            variables: { value: `${inputToEmit}_id_${uniqueIdRef.current}` },
          })
        }}
      >
        Emit the text
      </button>
    </section>
  )
}
