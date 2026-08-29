import { gql, type ApolloCache } from '@apollo/client'

type NodeValueType<T = unknown> = {
  __typename: string
} & {
  //& Record<string,unknown>
  [Property: string]: T extends object ? NodeValueType : unknown
}

const nodetoBeGced = {
  __typename: 'ToBeGced',
  id: '1',
  value: 'node to be gced',
}

const writeTestObjects = {
  toBeGarbaseCollected: nodetoBeGced,
  toBeEvicted: {
    __typename: 'ToBeEvicted',
    id: '1',
    value: 'node to be evicted',
    toBeGced: nodetoBeGced,
  },
  existingField: {
    __typename: 'ExistingField',
    id: '5',
    value: 'option',
  },
  writtenField: {
    __typename: 'WrittenField',
    id: '1',
    value: 'option',
  },
} satisfies Record<string, NodeValueType>

/**
 * To get the type of the gql query string.
 */
export type GqlQueryType<T extends keyof typeof writeTestObjects> = {
  [key in T]: (typeof writeTestObjects)[key]
}
/**
 * For {@link ApolloCache.writeQuery} function calls during testing.
 */
export const writeOptionsParams = {
  existingField: {
    query: gql`
      query {
        existingField {
          __typename
          id
          value
        }
      }
    `,
    data: writeTestObjects.existingField,
  },
  toBeEvicted: {
    query: gql`
      query {
        toBeEvicted {
          __typename
          id
          value
          toBeGced {
            __typename
            id
            value
          }
        }
      }
    `,
    data: {
      toBeEvicted: writeTestObjects.toBeEvicted,
    },
  },
  writtenField: {
    query: gql`
      query {
        writtenField {
          __typename
          id
          value
        }
      }
    `,
    data: { writtenField: writeTestObjects.writtenField },
  },
  toBeGarbaseCollected: {
    query: gql`
      query {
        toBeGced {
          __typename
          id
          value
        }
      }
    `,
    data: {
      toBeGced: writeTestObjects.toBeGarbaseCollected,
    },
  },
} satisfies Record<
  keyof typeof writeTestObjects,
  Parameters<ApolloCache['writeQuery']>[0]
>
