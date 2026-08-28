import { gql, type TypedDocumentNode } from '@apollo/client'
import { useMutation, useSubscription } from '@apollo/client/react'
import type { Mutation, Query } from '@types-gen-react-apollo'
import { canonicalSerialization } from 'canonical-serialization'
import { errorTesterOperationName } from '../../util/operationNames'

/**
 * To test errors in graphql responses
 */
export const GqlLinkErrorTester = () => {
  const queriableFieldResult = useSubscription(
    gql`
      subscription ${errorTesterOperationName} {
        subscribeForError
      }
    ` as TypedDocumentNode<Pick<Query, 'queriableField'>>,
    {
      // errorPolicy
    }
  )

  const [emitToSubscribers] = useMutation(
    gql`
      mutation emit${errorTesterOperationName}($value: String!) {
        emitString(value: $value)
      }
    ` as TypedDocumentNode<Pick<Mutation, 'emitString'>>
  )

  return (
    <section>
      {/* To test query type operations */}
      <h4>To test the error field in graphql reponses:</h4>
      <dl>
        <dt>Error in response from server:</dt>
        <dd data-testid='error-tester-error-message'>
          {canonicalSerialization(queriableFieldResult.error?.message, {
            keepCircularReferences: false,
          })}
        </dd>
      </dl>
      <button
        data-testid={`emit-error`}
        type='button'
        onClick={() => {
          emitToSubscribers({
            variables: { value: `to cause error.` },
          })
        }}
      >
        Emit the text
      </button>
    </section>
  )
}
