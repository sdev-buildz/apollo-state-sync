import type { SourceFile, WriterFunction } from 'ts-morph'
import { getNameFromNamedImport } from './getNameFromNamedImport'
type NamedImportsFiltered = NonNullable<
  Exclude<
    Parameters<SourceFile['addImportDeclaration']>[0]['namedImports'],
    WriterFunction
  >
>

/**
 *  Gets the variables which are already imported.
 *  @param sourceFile - The file in which the imports are to be considered.
 *  @param requiredImportDeclaration - The module and its variables to be considered.
 */
export const getAlreadyImportedNames = (
  sourceFile: SourceFile,
  requiredImportDeclaration: Parameters<SourceFile['addImportDeclaration']>[0]
): NamedImportsFiltered => {
  const requiredNamedImports = requiredImportDeclaration.namedImports
  if (!requiredNamedImports || typeof requiredNamedImports === 'function')
    return []
  /**
   * Whether the import statement is already present
   */
  const alreadyImported: NamedImportsFiltered = []

  //  Check whether the import statement is already present

  for (const /** Currently iterated import statement already present in the file */
    importedStatementIter of sourceFile.getImportDeclarations()) {
    //  Checking the module specifier
    if (
      importedStatementIter.getModuleSpecifier().getLiteralText() !==
      requiredImportDeclaration.moduleSpecifier
    )
      continue

    for (const /** Currently iterated required named import */
      reqNamedImportIter of requiredNamedImports) {
      for (const /** Currently iterated named import already present in the file */
        importedNameIter of importedStatementIter.getNamedImports()) {
        if (
          importedNameIter.getName() !==
          getNameFromNamedImport(reqNamedImportIter)
        )
          continue
        if (
          importedNameIter.isTypeOnly() &&
          typeof reqNamedImportIter === 'object' &&
          !reqNamedImportIter.isTypeOnly
        )
          // Checking if value is required but only type is imported
          continue
        alreadyImported.push(importedNameIter.getName())
      }
    }
  }
  return alreadyImported
}
