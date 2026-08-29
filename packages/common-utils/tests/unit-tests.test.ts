import { gql } from '@apollo/client'
import { getOperationType } from '@src'
import { OperationTypeNode } from 'graphql'

import { describe, expect, it } from 'vitest'

describe('getOperationType', () => {
  it('works for query types.', () => {
    const query = `
            query queryTest {
                queriableField
            }
        `
    const node = gql(query)
    expect(getOperationType(node)).toBe(OperationTypeNode.QUERY)
  })
  it('works for mutation types.', () => {
    const query = `
            mutation operationName {
                randomField
            }
        `
    const node = gql(query)
    expect(getOperationType(node)).toBe(OperationTypeNode.MUTATION)
  })
  it('works for subscription types.', () => {
    const query = `
            subscription testing($id: Int) {
                count(count: $id)
            }
        `
    const node = gql(query)
    expect(getOperationType(node)).toBe(OperationTypeNode.SUBSCRIPTION)
  })
})
