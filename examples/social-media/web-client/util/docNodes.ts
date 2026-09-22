import { gql, type TypedDocumentNode } from '@apollo/client'
import type { PageQueryOptions, Query } from '@types-gen-react-apollo'

/**
 * To fetch posts
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
` as TypedDocumentNode<Pick<Query, 'posts'>, { options: PageQueryOptions }>

/**
 * To fetch comments of a post
 */
export const commentsOfPostQuery = gql`
  query commentsOfPost($postId: ID!, $commentsOptions: PageQueryOptions) {
    post(id: $postId) {
      id
      comments(options: $commentsOptions) {
        data {
          id
          name
          body
        }
        meta {
          totalCount
        }
      }
    }
  }
` as TypedDocumentNode<
  Pick<Query, 'post'>,
  { postId: string; commentsOptions: PageQueryOptions }
>
