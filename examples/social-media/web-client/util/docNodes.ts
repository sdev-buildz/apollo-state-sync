import { gql, type TypedDocumentNode } from '@apollo/client'
import type { Query } from '@types-gen-react-apollo'

/**
 * To fetch the available products for catalog
 */
export const postsQuery = gql`
  query postsPage($options: PageQueryOptions) {
    posts(options: $options) {
      data {
        id
        title
        body
      }
      meta {
        totalCount
      }
    }
  }
` as TypedDocumentNode<Pick<Query, 'posts'>>
