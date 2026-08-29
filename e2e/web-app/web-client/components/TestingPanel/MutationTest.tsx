import { gql, type TypedDocumentNode } from '@apollo/client'
import { useMutation, useQuery } from '@apollo/client/react'
import type {
  Mutation,
  MutationSetMutableFieldArgs,
  Query,
} from '@types-gen-react-apollo'
import { useState } from 'react'

/**
 * To test mutation type operations
 */
export const MutationTest = () => {
  const [mutationInput, setMutationInput] = useState('a random text')
  const [mutateMutableField, mutationResult] = useMutation(
    gql`
      mutation mutate($value: String!) {
        setMutableField(value: $value)
      }
    ` as TypedDocumentNode<
      Pick<Mutation, 'setMutableField'>,
      MutationSetMutableFieldArgs
    >,
    {
      variables: {
        value: mutationInput,
      },
    }
  )

  const mutableFieldResult = useQuery(
    gql`
      query mutable {
        mutableField
      }
    ` as TypedDocumentNode<Pick<Query, 'mutableField'>>
  )

  return (
    <section className='mutation-operation'>
      {/* To test mutation type operations */}
      {/* Mutation form */}
      <form id='mutation-form'>
        <dl>
          <dt>Mutation result of Mutable Field:</dt>
          <dd data-testid='mutable-field-value'>
            {mutationResult.data?.setMutableField ?? 'null'}
          </dd>
        </dl>
        <label htmlFor='mutation-input'>
          Enter new value for mutable field
        </label>
        <input
          id='mutation-input'
          data-testid='mutation-input'
          type='text'
          onChange={(e) => setMutationInput(e.target.value)}
          value={mutationInput}
        ></input>
        <button
          data-testid='mutate-mutable-field'
          type='submit'
          onClick={(e) => {
            e.preventDefault()
            mutateMutableField({ variables: { value: mutationInput } })
          }}
        >
          Set Mutable Field
        </button>
      </form>
      <dl>
        <dt>Queried Mutable Field:</dt>
        <dd data-testid='queried-mutable-field-value'>
          {mutableFieldResult.data?.mutableField}
        </dd>
      </dl>
      <button
        data-testid='refetch-mutable'
        type='button'
        onClick={() => mutableFieldResult.refetch()}
      >
        Refetch Mutable Field
      </button>
    </section>
  )
}
