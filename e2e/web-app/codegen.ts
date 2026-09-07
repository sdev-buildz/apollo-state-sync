import { getCodegenConfig, runCodegen } from '@packages/web-app-utils'
import { schema } from './server/schema'

/** The path where the generated types are emitted to. */
const targetFilePath = `${import.meta.dirname}/generated/typescript-react-apollo.tsx`
runCodegen(getCodegenConfig(targetFilePath, schema))
