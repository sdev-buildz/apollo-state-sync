import type { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import type { SharedClientOptions } from 'graphql-shared-ws'
import type { ObjectLiteralExpression, SourceFile } from 'ts-morph'
import { Node, SyntaxKind, type Project } from 'ts-morph'
import {
  addManipulationCb,
  noteImportStmtToAdd,
} from './lib/batchManipulationOperations'

const sharedSocketName = 'SharedWebSocket'

/** Checks if the import statement already exists. */
const hasImportStmt = (
  sourceFile: SourceFile,
  moduleName: string,
  varName: string
) => {
  return sourceFile.getImportDeclarations().some((importDecl) => {
    if (importDecl.getModuleSpecifierValue() === moduleName) {
      return importDecl
        .getNamedImports()
        .some((named) => named.getName() === varName && !named.isTypeOnly())
    }
  })
}

/**
 * Migrates {@link GraphQLWsLink} to GraphQLSharedWsLink.
 */
export const migrateGqlWs = (project: Project) => {
  for (const sourceFile of project.getSourceFiles()) {
    sourceFile
      .getDescendantsOfKind(SyntaxKind.CallExpression)
      .forEach((callExpr) => {
        if (callExpr.wasForgotten()) return

        // Check if it's the function you want to replace
        if (callExpr.getExpression().getText() !== 'createClient') return

        /** The createClient(...) instantiation expression. */
        const gqlClientInitExpression = callExpr

        if (
          !gqlClientInitExpression?.isKind(SyntaxKind.CallExpression) ||
          !(
            gqlClientInitExpression.getFirstChild()?.getText() ===
            'createClient'
          )
        )
          return

        if (!hasImportStmt(sourceFile, 'graphql-ws', 'createClient')) return

        const gqlClientInitArg = gqlClientInitExpression?.getArguments()[0]

        let gqlClientOptionsObj: ObjectLiteralExpression
        if (Node.isObjectLiteralExpression(gqlClientInitArg)) {
          gqlClientOptionsObj = gqlClientInitArg as ObjectLiteralExpression
        } else return

        if (!gqlClientOptionsObj) return

        const webSocketImplFieldName =
          'webSocketImpl' satisfies keyof SharedClientOptions

        /** Already existing Custom WebSocket implementation */
        const existing = gqlClientOptionsObj.getProperty(webSocketImplFieldName)

        if (existing) {
          console.error(
            'Custom WwbSocket implementation is not migrated. Use AI or check the online docs for steps to migrate Custom WebSocket implementations.'
          )
          return
        }

        //  Add the SharedWebSocket to the webSocketImpl field
        addManipulationCb(() => {
          /** If the client is referenced in multiple places, the property will be assigned when iterating first reference and will already exist when iterating other references. */
          gqlClientOptionsObj.addPropertyAssignment({
            name: webSocketImplFieldName,
            initializer: 'SharedWebSocket',
          })
        })

        // Add the SharedWebSocket import statement
        noteImportStmtToAdd([
          {
            sourceFile,
            declarationStructures: [
              {
                moduleSpecifier: 'apollo-state-sync',
                namedImports: [sharedSocketName],
              },
            ],
          },
        ])
      })
  }
}
