import fs from 'node:fs/promises'
import path from 'node:path'
import { normalizeNewlines } from './normalizeNewlines'

/**
 * Recursively gets all relative file paths from a base directory.
 */
const getAllFiles = async (dirPath: string): Promise<string[]> => {
  let results: string[] = []
  const list = await fs.readdir(dirPath)

  for (const file of list) {
    const fullPath = path.join(dirPath, file)
    const stat = await fs.stat(fullPath)

    if (stat && stat.isDirectory()) {
      results = results.concat(
        (await getAllFiles(fullPath)).map((iter) => path.join(file, iter))
      )
    } else {
      // Store relative path to make comparison easy
      results.push(file)
    }
  }

  return results
}

/**
 * Compares the file structures of directories.
 */
export const areFileStructuresSame = async (
  path1: string,
  path2: string
): Promise<boolean> => {
  const files1 = await getAllFiles(path1)
  const files2 = await getAllFiles(path2)
  if (files1.length !== files2.length) return false
  for (const file of files1) if (!files2.includes(file)) return false
  return true
}

/**
 * Compares file structure of 2 directories recursively.
 * Also compares the contents of the files.
 */
export const areContentsSame = async (
  path1: string,
  path2: string
): Promise<boolean> => {
  const files1 = await getAllFiles(path1)
  const files2 = await getAllFiles(path2)
  for (const file of files1) {
    if (!files2.includes(file)) return false
    const content1 = await fs.readFile(path.join(path1, file), 'utf-8')
    const content2 = await fs.readFile(path.join(path2, file), 'utf-8')
    if (normalizeNewlines(content1) !== normalizeNewlines(content2)) {
      return false
    }
  }

  return true
}
