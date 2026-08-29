import { makeVarCacheSync } from 'apollo-state-sync'

makeVarCacheSync('sample-value1', 'rVar0')

/**
 * The reactive variable
 */
export const rvar1 = makeVarCacheSync('sample-value', 'rVar1')
