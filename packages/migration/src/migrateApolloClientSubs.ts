import type { ApolloClient } from '@apollo/client'
import {
  Expression,
  SyntaxKind,
  VariableDeclarationKind,
  type Block,
  type NewExpression,
  type Project,
} from 'ts-morph'
import {
  addManipulationCb,
  noteImportStmtToAdd,
} from './lib/batchManipulationOperations'
import { getApolloClientLinkParam } from './lib/getApolloClientLinkParam'
import { getTerminatingLink } from './lib/getTerminatingLink'
import { resolveIdentifierChain } from './lib/resolveIdentifier'

/**
 * Migrates {@link ApolloClient} instantiations.
 */
export const migrateApolloClientSubs = (project: Project) => {
  for (const sourceFile of project.getSourceFiles()) {
    sourceFile
      .getDescendantsOfKind(SyntaxKind.NewExpression)
      .forEach((newExpression) => {
        if (newExpression.wasForgotten()) return

        const apolloClientExpression = newExpression
        let linkParam = getApolloClientLinkParam(newExpression)
        /** new GraphQLWsLink(...) expression. */
        let gqlWsLinkExpression: NewExpression | undefined
        if (!linkParam) return
        else linkParam = getTerminatingLink(linkParam)
        if (!(
          linkParam.isKind(SyntaxKind.NewExpression) &&
          (linkParam.getExpression().getText() === 'GraphQLWsLink' ||
            linkParam.getExpression().getText() === 'GraphQLSharedWsLink')
        ))
          return

        if (!gqlWsLinkExpression) gqlWsLinkExpression = linkParam

        // Get the object parameters passed to the expression
        const arg = gqlWsLinkExpression.getArguments()[0]
        if (!arg) return

        if (!(arg instanceof Expression)) return
        const gqlClientInitExpression = resolveIdentifierChain(arg)
        if (
          !gqlClientInitExpression?.isKind(SyntaxKind.CallExpression) ||
          (gqlClientInitExpression.getFirstChild()?.getText() !==
            'createClient' &&
            gqlClientInitExpression.getFirstChild()?.getText() !==
              'createSharedClient')
        )
          return

        /**
         * If the link is not assigned to a variable, we have to create a variable.
         *   So that we can pass it to the `setupRestartSubscription`.
         */
        if (!gqlClientInitExpression) return

        const parent = gqlClientInitExpression.getParent()

        let gqlClient: string = `gqlClient`
        //  If the link is already in a variable
        if (
          parent?.isKind(SyntaxKind.VariableDeclaration) &&
          parent.getFirstChild()?.getText()
        ) {
          gqlClient = parent.getFirstChild()!.getText()
        }
        //  else Create a variable and assign the link to it
        else {
          const statement = apolloClientExpression.getFirstAncestorByKind(
            SyntaxKind.VariableStatement
          )
          const idx = statement?.getChildIndex()
          const parent = statement?.getParentOrThrow(
            `Couldn't migrate subscription.restart.`
          )
          addManipulationCb(() => {
            ;(parent as Block).insertVariableStatement(idx!, {
              declarationKind: VariableDeclarationKind.Const,
              declarations: [
                {
                  name: gqlClient,
                  initializer: gqlClientInitExpression!.getText(),
                },
              ],
            })
            gqlClientInitExpression?.replaceWithText(
              gqlClientInitExpression!.getText()
            )
          })
        }
        addManipulationCb(() => {
          apolloClientExpression.replaceWithText(
            `setupRestartSubscription(${apolloClientExpression.getFullText()},{ sharedClient: ${gqlClient} })`
          )
        })

        noteImportStmtToAdd([
          {
            sourceFile,
            declarationStructures: [
              {
                moduleSpecifier: 'apollo-state-sync',
                namedImports: ['setupRestartSubscription'],
              },
            ],
          },
        ])
      })
  }
}
