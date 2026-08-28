import { type SourceFile } from 'ts-morph'
import { getAlreadyImportedNames } from './getAlreadyImportedNames'
import { getNameFromNamedImport } from './getNameFromNamedImport'

/**
 * The import statements which are required to be added to the source files.
 */
export type ImportStmtsInFiles = Array<{
  sourceFile: SourceFile
  declarationStructures: Array<
    Parameters<SourceFile['addImportDeclaration']>[0]
  >
}>

/**
 * Adds import statements while avoiding duplicate imports.
 */
export const addImportStmts = (
  importDeclarationsInFiles: ImportStmtsInFiles
) => {
  for (const perFile of importDeclarationsInFiles) {
    const sourceFile = perFile.sourceFile
    const requiredImportDeclarations = perFile.declarationStructures
    const finalizedDeclarationsToAdd: Array<{
      sourceFile: SourceFile
      declarationStructure: Required<
        Pick<
          Parameters<SourceFile['addImportDeclaration']>[0],
          'moduleSpecifier' | 'namedImports'
        >
      >
    }> = []
    for (const requiredDeclaration of requiredImportDeclarations) {
      /**
       * Whether the import statement is already present
       */
      const alreadyImported = getAlreadyImportedNames(
        sourceFile,
        requiredDeclaration
      )
      if (
        !requiredDeclaration.namedImports ||
        typeof requiredDeclaration.namedImports === 'function'
      )
        continue
      /**
       * The variables which are not already imported
       */
      const namesToImport = requiredDeclaration.namedImports.filter(
        (requiredNamedImport) => {
          return (
            alreadyImported.find(
              (imported) =>
                getNameFromNamedImport(imported) ===
                getNameFromNamedImport(requiredNamedImport)
            ) === undefined
          )
        }
      )

      /**
       * If there are any variables which are not already imported,
       *    add them to the {@link finalizedDeclarationsToAdd} array.
       */
      if (namesToImport.length) {
        finalizedDeclarationsToAdd.push({
          sourceFile,
          declarationStructure: {
            moduleSpecifier: requiredDeclaration.moduleSpecifier,
            namedImports: namesToImport,
          },
        })
      }
    }

    /**
     * Adding the import statements by manipulating the files.
     */
    for (const declaration of finalizedDeclarationsToAdd) {
      declaration.sourceFile.addImportDeclaration(
        declaration.declarationStructure
      )
    }
  }
}
