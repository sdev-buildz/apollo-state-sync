import { createOperation } from '@apollo/client/link/utils'

import type { ApolloClient } from '@apollo/client'
import { DocumentTransform } from '@apollo/client'
import {
  NotImplementedHandler,
  type Incremental,
} from '@apollo/client/incremental'
import type { ApolloLink } from '@apollo/client/link'
import { getOperationName } from '@apollo/client/utilities/internal'
import { getOperationType } from '@packages/common-utils'
import { print } from 'graphql'
import type { SharedClient } from 'graphql-shared-ws'
import type { ClientResolver, ClientResolverOperation } from './ClientResolver'
import { getDocumentInfo, getVariables } from './lib/apollo-client-lib-internal'

/**
 * Replaces the restart function returned by {@link ApolloClient.subscribe}.
 *
 * Instead of invoking Apollo's default restart behavior, this wrapper delegates
 * to {@link SharedClient.restartSubscription}. The original Apollo client is
 * mutated in place and returned.
 *
 * When using {@link ApolloLink.split}, pass a
 * {@link ClientResolver | sharedClientResolver} in the options so the
 * SharedClient can be resolved per operation.
 */
export const setupRestartSubscription = (
  apolloClient: ApolloClient,
  options: { incrementalHandler?: Incremental.Handler } & (
    | {
        sharedClient: SharedClient
      }
    | {
        sharedClientResolver: ClientResolver
      }
  )
) => {
  const originalSubscribe = apolloClient.subscribe.bind(apolloClient)

  // Wrap ApolloClient.subscribe so each returned subscription can use the
  // SharedClient's restart flow instead of Apollo's default restart behavior.
  apolloClient.subscribe = function (...args) {
    /** The subscription object returned by ApolloClient.subscribe. */
    const subscribeRes = originalSubscribe(...args)

    const clientResolverOperation: ClientResolverOperation = {
      ...args[0],
      client: this,
      operationName: getOperationName(args[0].query),
      operationType: getOperationType(args[0].query)!,
    }
    let sharedClient: SharedClient | undefined
    if ('sharedClient' in options) sharedClient = options.sharedClient
    else sharedClient = options.sharedClientResolver(clientResolverOperation)
    if (!sharedClient) return subscribeRes

    const restartSubscriptionFn =
      sharedClient.restartSubscription.bind(sharedClient)

    const subscribeOptions = args[0]

    // Applying document transforms
    const defaultDocumentTransform = new DocumentTransform((document) =>
      this.cache.transformDocument(document)
    )
    const documentTransform = this.documentTransform
      ? defaultDocumentTransform
          .concat(this.documentTransform)
          .concat(defaultDocumentTransform)
      : defaultDocumentTransform
    const transformedQuery = documentTransform.transformDocument(
      subscribeOptions.query
    )

    // Build the ApolloLink operation used when restarting the subscription.
    const { serverQuery } = getDocumentInfo(transformedQuery)
    const context = subscribeOptions.context
    const incrementalHandler =
      options.incrementalHandler ?? new NotImplementedHandler()
    const request: ApolloLink.Request = incrementalHandler.prepareRequest({
      query: serverQuery,
      variables: getVariables(
        subscribeOptions.query,
        subscribeOptions.variables
      ),
      context: {
        ...this.defaultContext,
        ...context,
        queryDeduplication:
          context?.queryDeduplication ?? this.queryDeduplication,
      },
      extensions: subscribeOptions.extensions ?? {},
    })
    const operation: ApolloLink.Operation = createOperation(request, {
      client: this,
    })

    // Replace the subscription's restart method with the SharedClient.restart.
    const originalRestart = subscribeRes.restart
    subscribeRes.restart = () => {
      if (restartSubscriptionFn)
        restartSubscriptionFn({
          query: print(operation.query),
          variables: operation.variables,
          extensions: operation.extensions,
        })
      else originalRestart()
    }

    return subscribeRes
  }

  return apolloClient
}
