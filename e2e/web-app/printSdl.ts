import { writeFileSync } from 'fs'
import type { GraphQLSchema } from 'graphql'
import { lexicographicSortSchema, printSchema } from 'graphql'
import sharedConfig from './shared/config'

import path from 'node:path'
import { schema } from './server/schema'

/**
 *  Generates and writes the schema.graphql file for the given schema.
 */
export function printGraphqlSdl(server: ServerDetails) {
  const schemaAsString = printSchema(lexicographicSortSchema(server.schema))
  writeFileSync(server.path, schemaAsString)
}

type ServerDetails = {
  schema: GraphQLSchema
  path: string
}

const servers: ServerDetails[] = [
  {
    schema: schema,
    path: path.join(import.meta.dirname, sharedConfig.graphqlSdlPath),
  },
]

for (const server of servers) {
  printGraphqlSdl(server)
}

process.exit(0)
