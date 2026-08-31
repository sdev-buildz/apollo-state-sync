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
import { getDocumentInfo, getVariables } from './lib/apollo-client-lib-internal'

type ClientResolverOperation = Omit<
  ApolloLink.Operation,
  'setContext' | 'getContext' | 'extensions' | 'variables'
> &
  Partial<Pick<ApolloLink.Operation, 'extensions' | 'variables'>>

/**
 * Given a graphql operation, returns the {@link SharedClient} to use.
 *
 * It is useful only when {@link ApolloLink.split} is used.
 * It should return the same result as {@link ApolloLink.split}.
 * @returns The client if it is a {@link SharedClient}, undefined otherwise
 */
export type ClientResolver = (
  operation: ClientResolverOperation
) => SharedClient | undefined

/**
 * Overwrites the restart function returned by {@link ApolloClient.subscribe}.
 * It prevents the default behavior of the 'restart' function and instead
 *  invokes the {@link SharedClient.restartSubscription}.
 * It modifies the ApolloClient in place and also returns the modified ApolloClient.
 *
 * In case you are using {@link ApolloLink.split}, provide the
 *  sharedClientResolver field in the options parameter.
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

  // Wrapping ApolloClient.subscribe function.
  //  The wrapper modifies the restart function returned, during each operation.
  apolloClient.subscribe = function (...args) {
    /** The response of ApolloClient.subscribe */
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

    // Creating ApolloLink.Operation
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

    //  Overwriting the restart method
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
