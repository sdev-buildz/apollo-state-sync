import type { DocumentNode } from '@apollo/client'
import type { OperationTypeNode } from 'graphql'

/**
 * Returns the type of the operation (query/mutation/subscription)
 */
export const getOperationType = (node: DocumentNode): OperationTypeNode => {
  const operationDefinition = node.definitions.find(
    (def) => def.kind === 'OperationDefinition'
  )
  return operationDefinition!.operation
}
