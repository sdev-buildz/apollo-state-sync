import { getCodegenConfig, runCodegen } from '@packages/web-app-utils'
import path from 'node:path'

const tsEmitFilePath = `${import.meta.dirname}/generated/typescript-react-apollo.tsx`

runCodegen(
  getCodegenConfig(
    tsEmitFilePath,
    path.join(import.meta.dirname, './schema.gql')
  )
)
