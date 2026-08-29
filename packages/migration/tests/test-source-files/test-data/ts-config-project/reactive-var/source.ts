import { makeVar } from '@apollo/client'

makeVar('sample-value1')

/**
 * The reactive variable
 */
export const rvar1 = makeVar('sample-value')
