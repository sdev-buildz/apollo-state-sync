/**
 * @packageDocumentation
 * The QueryManager class in ApolloClient library are not exported.
 * But their functionalities are required by 'apollo-state-sync'. So I copy pasted
 *  from ApolloClient library to this module and exported from this module.
 */
import type { ApolloClient } from '@apollo/client'
import { cacheSizes } from '@apollo/client/utilities'
import {
  AutoCleanedWeakCache,
  getDefaultValues,
  getOperationDefinition,
  hasDirectives,
  hasForcedResolvers,
  removeDirectivesFromDocument,
} from '@apollo/client/utilities/internal'
import { Kind, visit, type DocumentNode } from 'graphql'

/**
 * Copy pasted from ApolloClient library because it is not exported from the library.
 */
export const getDocumentInfo = (document: DocumentNode) => {
  const transformCache = new AutoCleanedWeakCache(
    cacheSizes['queryManager.getDocumentInfo'] ||
      2000 /* defaultCacheSizes["queryManager.getDocumentInfo"] */
  )
  if (!transformCache.has(document)) {
    const operationDefinition = getOperationDefinition(document)
    const cacheEntry = {
      // TODO These three calls (hasClientExports, shouldForceResolvers, and
      // usesNonreactiveDirective) are performing independent full traversals
      // of the transformed document. We should consider merging these
      // traversals into a single pass in the future, though the work is
      // cached after the first time.
      hasClientExports: hasDirectives(['client', 'export'], document, true),
      hasForcedResolvers: hasForcedResolvers(document),
      hasNonreactiveDirective: hasDirectives(['nonreactive'], document),
      hasIncrementalDirective: hasDirectives(['defer'], document),
      nonReactiveQuery: addNonReactiveToNamedFragments(document),
      clientQuery: hasDirectives(['client'], document) ? document : null,
      serverQuery: removeDirectivesFromDocument(
        [
          { name: 'client', remove: true },
          { name: 'connection' },
          { name: 'nonreactive' },
          { name: 'unmask' },
        ],
        document
      ),
      operationType: operationDefinition?.operation,
      defaultVars: getDefaultValues(operationDefinition),
      // Transform any mutation or subscription operations to query operations
      // so we can read/write them from/to the cache.
      asQuery: {
        ...document,
        definitions: document.definitions.map((def) => {
          if (def.kind === 'OperationDefinition' && def.operation !== 'query') {
            return { ...def, operation: 'query' }
          }
          return def
        }),
      },
    }
    transformCache.set(document, cacheEntry)
  }
  const entry = transformCache.get(document)
  if (entry.violation) {
    throw entry.violation
  }
  return entry
}

/**
 *  Copy pasted from QueryManager.getVariables
 */
export const getVariables = (
  document: DocumentNode,
  variables: ApolloClient.SubscribeOptions['variables']
) => {
  const defaultVars = getDocumentInfo(document).defaultVars
  const varsWithDefaults = Object.entries(variables ?? {}).map(
    ([key, value]) => [key, value === undefined ? defaultVars[key] : value]
  )
  return {
    ...defaultVars,
    ...Object.fromEntries(varsWithDefaults),
  }
}

function addNonReactiveToNamedFragments(document: DocumentNode) {
  return visit(document, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    FragmentSpread: (node) => {
      // Do not add `@nonreactive` if the fragment is marked with `@unmask`
      // since we want to react to changes in this fragment.
      if (
        node.directives?.some((directive) => directive.name.value === 'unmask')
      ) {
        return
      }
      return {
        ...node,
        directives: [
          ...(node.directives || []),
          {
            kind: Kind.DIRECTIVE,
            name: { kind: Kind.NAME, value: 'nonreactive' },
          },
        ],
      }
    },
  })
}
