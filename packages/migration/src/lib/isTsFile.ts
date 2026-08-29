import type { SourceFile } from 'ts-morph'

/**
 * Whether the given file is a TypeScript file or not.
 */
export const isTsFile = (sourceFile: SourceFile): boolean => {
  const fileExtension = sourceFile.getExtension()
  const isTypescriptFile: boolean =
    fileExtension === '.ts' ||
    fileExtension === '.tsx' ||
    fileExtension === '.mts'
  return isTypescriptFile
}
