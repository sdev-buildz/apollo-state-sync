import type { ApolloLink } from '@apollo/client'
import type { CallExpression, Node } from 'ts-morph'
import { Expression, SyntaxKind } from 'ts-morph'
import { pruneAsAndSatisfies } from './pruneAsAndSatisfies'
import { resolveIdentifierChain } from './resolveIdentifier'

/**
 * sfdsf
 */
export const getTerminatingLink = (expr: Expression) => {
  while (expr.isKind(SyntaxKind.CallExpression)) {
    const callExpr: CallExpression = expr
    /**
     * Call Expressions could be {@link ApolloLink.from} or {@link ApolloLink.split}
     */

    /**
     * The function which is called
     */
    let func: Node | undefined = callExpr.getFirstChildOrThrow()
    if (!(func instanceof Expression)) return expr
    func = resolveIdentifierChain(func)
    if (!func?.isKind(SyntaxKind.PropertyAccessExpression)) return expr
    if (!(
      func.getFirstChild()?.getText() === 'ApolloLink' &&
      func.getChildrenOfKind(SyntaxKind.Identifier)[1]?.getText() === 'from'
    ))
      return expr
    const links = resolveIdentifierChain(
      callExpr.getArguments()[0]! as Expression
    )
    if (!links?.isKind(SyntaxKind.ArrayLiteralExpression)) return expr
    const terminatingLinkInitializer = pruneAsAndSatisfies(
      links.getElements()[links.getElements().length - 1]
    )
    const terminatingLink = resolveIdentifierChain(terminatingLinkInitializer)
    if (!terminatingLink) return expr

    expr = terminatingLink
  }
  return expr
}
