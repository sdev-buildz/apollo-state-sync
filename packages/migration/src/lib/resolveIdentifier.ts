import type { Expression, Identifier } from 'ts-morph'
import { SyntaxKind } from 'ts-morph'
import { pruneAsAndSatisfies } from './pruneAsAndSatisfies'

/**
 * Resolves variable to get the value assigned to it.
 *  If its value is another variable, recursively resolves the
 *   another variable.
 * @example
 * const a = "actual-value"
 * const b = a
 * const c = b
 * // Calling resolveIdentifierChain with 'c' will return "actual-value"
 */
export const resolveIdentifierChain = (identifier: Expression | undefined) => {
  if (!identifier) return undefined
  let lastAssiignedRight: Expression | undefined = identifier
  do {
    lastAssiignedRight = pruneAsAndSatisfies(lastAssiignedRight)
    if (lastAssiignedRight?.isKind(SyntaxKind.Identifier))
      lastAssiignedRight = resolveIdentifier(lastAssiignedRight)
  } while (
    lastAssiignedRight &&
    lastAssiignedRight.isKind(SyntaxKind.Identifier)
  )

  return lastAssiignedRight
}

/**
 * Gets the Right side of the identifier's last assignment in the file.
 * @example
 * let a = 'first-value'
 * let b = 3
 * a = 'second-value'
 * b = 5
 * // Calling resolveIdentifier with 'a' returns 'second-value'.
 */
const resolveIdentifier = (identifier: Identifier) => {
  const references = identifier.findReferencesAsNodes()
  const assignments = references
    .map((ref) => ref.getFirstAncestorByKind(SyntaxKind.VariableDeclaration))
    .filter((parent) => {
      return parent?.getFirstChild()?.getText() === identifier?.getText()
    })

  const lastAssignment = assignments[assignments.length - 1]

  return lastAssignment?.getChildAtIndex(2) as Expression
}
