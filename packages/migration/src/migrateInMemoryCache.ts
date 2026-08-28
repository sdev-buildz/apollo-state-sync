import type { ApolloClient } from '@apollo/client'
import { SyntaxKind, type Project } from 'ts-morph'
import {
  addManipulationCb,
  noteImportStmtToAdd,
} from './lib/batchManipulationOperations'
import { isTsFile } from './lib/isTsFile'

/**
 * Migrates {@link ApolloClient} initializations
 */
export const migrateInMemoryCache = (project: Project) => {
  for (const sourceFile of project.getSourceFiles()) {
    sourceFile
      .getDescendantsOfKind(SyntaxKind.NewExpression)
      .forEach((newExpression) => {
        if (newExpression.wasForgotten()) return

        if (newExpression.getExpression().getText() !== 'InMemoryCache') return
        let parent: ReturnType<typeof newExpression.getParent> =
          newExpression.getParent()
        while (
          parent?.isKind(SyntaxKind.AsExpression) ||
          parent?.isKind(SyntaxKind.SatisfiesExpression)
        ) {
          parent = parent.getParent()
        }
        if (!parent) return

        // Check if setupSync has already been called
        const isAlreadyMigrated =
          parent.isKind(SyntaxKind.CallExpression) &&
          parent.getExpression().getText() === 'setupSync'

        if (isAlreadyMigrated) return
        const isTypescriptFile: boolean = isTsFile(sourceFile)
        addManipulationCb(() => {
          newExpression.replaceWithText(
            isTypescriptFile
              ? `new InMemoryCacheSynced() as InMemoryCache`
              : `new InMemoryCacheSynced()`
          )
        })

        /**
         * Adding import statements.
         */
        noteImportStmtToAdd([
          {
            sourceFile,
            declarationStructures: [
              {
                moduleSpecifier: 'apollo-state-sync',
                namedImports: [
                  {
                    name: 'InMemoryCacheSynced',
                  },
                ],
              },
            ],
          },
        ])
      })
  }
}
