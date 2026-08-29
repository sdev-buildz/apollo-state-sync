/* eslint-disable tsdoc/syntax */
import type { Expression } from 'ts-morph'
import { SyntaxKind } from 'ts-morph'

/**
 * Prunes down TypeScript {@link SyntaxKind.AsExpression | As expressions} and {@link SyntaxKind.SatisfiesExpression Satisfies expressions}.
 * @example
 *
 * const a = {field1: 'random'} as { field1: 'random'|'non-random' };
 * //  The above TypeScript 'as expression' will be pruned to get the following expression
 * {field1: 'random'}
 */
export const pruneAsAndSatisfies = (expression: Expression | undefined) => {
  if (!expression) return
  let prunedExpression: Expression | undefined = expression
  while (
    prunedExpression?.isKind(SyntaxKind.AsExpression) ||
    prunedExpression?.isKind(SyntaxKind.SatisfiesExpression)
  )
    prunedExpression = prunedExpression.getFirstChild()

  return prunedExpression
}
