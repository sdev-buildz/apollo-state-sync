import { buildGraphQL, getCodegenConfig } from '@packages/web-app-utils'
import { sharedConfig } from '@packages/web-app-utils/shared'
import path from 'node:path'
import { schema } from './server/schema'

const tsEmitFilePath = `${import.meta.dirname}/generated/typescript-react-apollo.tsx`

console.log(
  `path.join(import.meta.dirname, sharedConfig.graphqlSdlPath) =`,
  path.join(import.meta.dirname, sharedConfig.graphqlSdlPath)
)

buildGraphQL(
  schema,
  path.join(import.meta.dirname, sharedConfig.graphqlSdlPath),
  getCodegenConfig(tsEmitFilePath, schema)
)
