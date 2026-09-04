import { SyntaxKind, type Project } from 'ts-morph'
import {
  addManipulationCb,
  noteImportStmtToAdd,
} from './lib/batchManipulationOperations'

/**
 * Migrates all the Apollo Client initializations
 */
export const migrateMakeVar = (project: Project) => {
  let rVarCount = 0
  for (const sourceFile of project.getSourceFiles()) {
    sourceFile
      .getDescendantsOfKind(SyntaxKind.CallExpression)
      .forEach((callExpression) => {
        if (callExpression.wasForgotten()) return

        // Check if it's the function you want to replace
        if (callExpression.getExpression().getText() !== 'makeVar') return
        addManipulationCb(() => {
          callExpression.replaceWithText(
            `makeVarSynced(${callExpression.getChildAtIndex(2).getText()}, 'rVar${rVarCount++}')`
          )
        })
        noteImportStmtToAdd([
          {
            sourceFile,
            declarationStructures: [
              {
                moduleSpecifier: 'apollo-state-sync',
                namedImports: ['makeVarSynced'],
              },
            ],
          },
        ])
      })
  }
}
