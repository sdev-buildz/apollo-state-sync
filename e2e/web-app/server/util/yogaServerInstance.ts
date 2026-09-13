import { createYoga } from 'graphql-yoga'
import { type GraphqlContextType } from '../lib/types'
import { winstonYogaLogger } from '../lib/winstonYogaLogger'
import { schema } from '../schema'
import { initGraphqlContext } from './initGraphqlContext'

/**
 * The GraphQL server instance.
 */
export const yoga = createYoga<GraphqlContextType>({
  schema: schema,
  context: (context) => {
    return initGraphqlContext(context)
  },
  graphiql: {
    subscriptionsProtocol: 'WS',
  },
  logging: winstonYogaLogger,
})
