import type { NewExpression } from 'ts-morph'
import { Expression, Node, SyntaxKind } from 'ts-morph'
import { resolveIdentifierChain } from './resolveIdentifier'

/**
 * @returns the Apollo link in constructor param,
 *      if the expression is not a valid ApolloClient intialization expression
 */
export const getApolloClientLinkParam = (
  newExpression: NewExpression
): Expression | undefined => {
  // Check if it's the function you want to replace
  if (newExpression.getExpression().getText() !== 'ApolloClient') return
  /**
   * The {@link SyntaxKind.NewExpression} which
   */
  const apolloClientExpression = newExpression
  const arg = apolloClientExpression.getArguments()[0]
  if (!arg || !(arg instanceof Expression)) return
  const constructorObj = resolveIdentifierChain(arg)
  if (
    !constructorObj ||
    !constructorObj.isKind(SyntaxKind.ObjectLiteralExpression)
  )
    return

  /**
   * Resolving the GraphQLSharedWsLink identifier from the
   *  Apollo Client's constructor params
   */

  /**
   * The link field of the ApolloClient constructor param
   */
  const param = constructorObj.getProperty('link')
  if (!Node.isPropertyAssignment(param)) return
  const linkInitializer = param.getInitializerOrThrow()
  let ptr: Expression | undefined = linkInitializer
  ptr = resolveIdentifierChain(ptr)
  return ptr
}
