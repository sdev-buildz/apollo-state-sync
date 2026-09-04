import { makeVarSynced } from 'apollo-state-sync'

makeVarSynced('sample-value1', 'rVar0')

/**
 * The reactive variable
 */
export const rvar1 = makeVarSynced('sample-value', 'rVar1')
