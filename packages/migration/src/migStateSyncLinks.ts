import type { ApolloClient } from '@apollo/client'
import { SyntaxKind, type Project } from 'ts-morph'
import { noteImportStmtToAdd } from './lib/batchManipulationOperations'
import { getApolloClientLinkParam } from './lib/getApolloClientLinkParam'

/**
 * Migrates {@link ApolloClient} instantiations.
 * Inserts stateSyncLinks to Apollo Clients.
 */
export const migrateStateSyncLink = (project: Project) => {
  for (const sourceFile of project.getSourceFiles()) {
    sourceFile
      .getDescendantsOfKind(SyntaxKind.NewExpression)
      .forEach((newExpression) => {
        if (newExpression.wasForgotten()) return

        const apolloLink = getApolloClientLinkParam(newExpression)
        if (!apolloLink) return

        //  adding this statement => "import { stateSyncLink } from 'apollo-state-sync'"
        noteImportStmtToAdd([
          {
            sourceFile,
            declarationStructures: [
              {
                moduleSpecifier: 'apollo-state-sync',
                namedImports: ['stateSyncLink'],
              },
            ],
          },
        ])
        //  adding this statement => "import { stateSyncLink } from 'apollo-state-sync'"
        noteImportStmtToAdd([
          {
            sourceFile,
            declarationStructures: [
              {
                moduleSpecifier: '@apollo/client',
                namedImports: ['ApolloLink'],
              },
            ],
          },
        ])

        //  Wrapping the ApolloLink with ApolloLink.from and stateSyncLink.
        apolloLink.replaceWithText(
          `ApolloLink.from([stateSyncLink,${apolloLink.getFullText()}])`
        )
      })
  }
}
