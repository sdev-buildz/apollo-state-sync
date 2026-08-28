import { addImportStmts, type ImportStmtsInFiles } from './addImportStmts'

/**
 * The import statements to be added to the source files.
 */
export const importStmtsToAdd: ImportStmtsInFiles = []

/**
 * Adds import declarations while avoiding duplicate imports.
 */
export const noteImportStmtToAdd = (declarations: typeof importStmtsToAdd) => {
  importStmtsToAdd.push(...declarations)
}

/**
 * Callbacks which manipulate the source files.
 * These will be executed together as a batch at the end of the execution.
 */
const manipulationCbs: (() => void)[] = []

/**
 * Adds a callback to {@link manipulationCbs}.
 */
export const addManipulationCb = (cb: (typeof manipulationCbs)[number]) => {
  manipulationCbs.push(cb)
}

/**
 * Executes the callbacks of {@link manipulationCbs}.
 */
const executeManipulationCbs = () => {
  manipulationCbs.forEach((cb) => cb())
  manipulationCbs.splice(0, manipulationCbs.length)
}

/**
 * Executes all the batched operations together.
 * To be called at the end of the migration.
 */
export const executeBatches = () => {
  executeManipulationCbs()
  addImportStmts(importStmtsToAdd)
  importStmtsToAdd.splice(0, importStmtsToAdd.length)
}
