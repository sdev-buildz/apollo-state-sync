import { gql, type TypedDocumentNode } from '@apollo/client'
import type { PageQueryOptions, Query } from '@types-gen-react-apollo'

/**
 * To fetch the available products for catalog
 */
export const postsQuery = gql`
  query postsPage(
    $options: PageQueryOptions
    $commentsOptions: PageQueryOptions
  ) {
    posts(options: $options) {
      data {
        id
        title
        body
        comments(options: $commentsOptions) {
          data {
            id
            name
            body
          }
        }
      }
      meta {
        totalCount
      }
    }
  }
` as TypedDocumentNode<
  Pick<Query, 'posts'>,
  { options: PageQueryOptions; commentsOptions: PageQueryOptions }
>
