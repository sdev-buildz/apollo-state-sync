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

        /** The link parameter passed to 'new ApolloClient(\{ link \})' expression. */
        let linkParam = getApolloClientLinkParam(newExpression)

        /** The `new GraphQLWsLink(...)` expression. */
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

        /** The first parameter passed to 'new GraphQLWsLink(...)'. */
        const arg = gqlWsLinkExpression.getArguments()[0]
        if (!arg || !(arg instanceof Expression)) return

        /**
         * The graphql-ws client initialization expression.
         * @example
         * ```ts
         *  createClient({ url , ... })
         * ```
         */
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
         * If the graphql-ws client is not assigned to a variable, we have to create a variable and assign.
         *   So that we can pass the same client instance to the second parameter of `setupRestartSubscription`.
         */
        if (!gqlClientInitExpression) return

        /**
         * The parent of the 'createClient()' expression.  
         *
         * This could be a variable declaration.
         * ```ts
         * const client = createClient({ url })
         * ```
         * Or could be a 'new GraphQLWsLink()' expression.
         * ```ts
         * new GraphQLWsLink( createClient({ url }) )
         * ```
         */
        const parent = gqlClientInitExpression.getParent()

        /** The name of the variable storing the graphql-ws client. */
        let gqlClientVarName: string = `gqlClient`
        if (
          //  If the client is already to a variable
          parent?.isKind(SyntaxKind.VariableDeclaration) &&
          parent.getFirstChild()?.getText()
        ) {
          gqlClientVarName = parent.getFirstChild()!.getText()
        } else {
          //  else Create a variable and assign the client to it
          const statement = gqlWsLinkExpression.getFirstAncestorByKind(
            SyntaxKind.VariableStatement
          )
          const idx = statement?.getChildIndex()
          const parentOfStatement = statement?.getParentOrThrow(
            `Couldn't migrate subscription.restart.`
          )
          addManipulationCb(() => {
            ;(parentOfStatement as Block).insertVariableStatement(idx!, {
              declarationKind: VariableDeclarationKind.Const,
              declarations: [
                {
                  name: gqlClientVarName,
                  initializer: gqlClientInitExpression!.getText(),
                },
              ],
            })
            gqlClientInitExpression?.replaceWithText(gqlClientVarName)
          })
        }

        addManipulationCb(() => {
          apolloClientExpression.replaceWithText(
            `setupRestartSubscription(${apolloClientExpression.getFullText()},{ sharedClient: ${gqlClientVarName} })`
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
