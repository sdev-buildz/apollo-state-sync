import { gql, type TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import type { Query } from '@types-gen-react-apollo'

/**
 * To test query type operations
 */
export const QueryTest = () => {
  const queriableFieldResult = useQuery(
    gql`
      query queriable {
        queriableField
      }
    ` as TypedDocumentNode<Pick<Query, 'queriableField'>>,
    {
      fetchPolicy: 'cache-first',
    }
  )

  return (
    <section className='swrvice-worker-query-operation'>
      {/* To test query type operations */}\<h4>To test query operations:</h4>
      <dl>
        <dt>Queriable Field:</dt>
        <dd data-testid='queriable-field-value'>
          {queriableFieldResult.data?.queriableField}
        </dd>
      </dl>
      <button
        data-testid='refetch-queriable'
        type='button'
        onClick={() => queriableFieldResult.refetch()}
      >
        Refetch Queriable Field
      </button>
    </section>
  )
}
