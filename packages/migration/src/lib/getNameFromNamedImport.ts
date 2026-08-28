import type { SourceFile, WriterFunction } from 'ts-morph'

/**
 * Gets the name string of the given namedImport parameter.
 */
export const getNameFromNamedImport = (
  namedImport: NonNullable<
    Exclude<
      Parameters<SourceFile['addImportDeclaration']>[0]['namedImports'],
      WriterFunction
    >
  >[number]
): string | undefined => {
  return typeof namedImport === 'string'
    ? namedImport
    : typeof namedImport === 'object'
      ? namedImport.name
      : undefined
}
