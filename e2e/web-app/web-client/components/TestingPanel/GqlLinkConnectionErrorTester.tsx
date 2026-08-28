import { gql, type TypedDocumentNode } from '@apollo/client'
import { useSubscription } from '@apollo/client/react'
import type {
  Subscription,
  SubscriptionSubscribeToEmittedStringArgs,
} from '@types-gen-react-apollo'
import { connErrorTesterOperationName } from '../../util/operationNames'

/**
 * To test errors in graphql responses
 */
export const GqlLinkConnectionErrorTester = () => {
  const subscribableFieldResult = useSubscription(
    gql`
      subscription ${connErrorTesterOperationName} {
        subscribeToEmittedString(browserId: $browserId)
      }
    ` as TypedDocumentNode<
      Pick<Subscription, 'subscribeToEmittedString'>,
      SubscriptionSubscribeToEmittedStringArgs
    >,
    { variables: { browserId: 'random' } }
  )

  return (
    <section>
      {/* To test query type operations */}
      <h4>To test the error field in graphql reponses:</h4>
      <dl>
        <dt>Error in response from server:</dt>
        <dd data-testid='conn-error-tester-error-name'>
          {subscribableFieldResult.error?.name}
        </dd>
      </dl>
      <label data-testid='conn-error-tester-label' />
    </section>
  )
}
