import { GqlLinkConnectionErrorTester } from './GqlLinkConnectionErrorTester'
import { GqlLinkErrorTester } from './GqlLinkErrorTester'
import { MutationTest } from './MutationTest'
import { QueryTest } from './QueryTest'
import { ReactiveVarTest } from './ReactiveVarTest'
import { SubscriptionTest } from './SubscriptionTest'

/**
 * All the products available
 */
export const TestingPanel = () => {
  return (
    <section className='testing-panel'>
      <hgroup>
        <h2>Testing Panel</h2>
        <p>Use the following buttons to test the operations</p>
      </hgroup>

      <QueryTest />
      <ReactiveVarTest />

      <MutationTest />

      <SubscriptionTest />

      <GqlLinkErrorTester />

      <GqlLinkConnectionErrorTester />
    </section>
  )
}
