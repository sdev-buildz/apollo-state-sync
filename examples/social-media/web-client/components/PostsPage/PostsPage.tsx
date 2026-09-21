import { useQuery } from '@apollo/client/react'
import { postsQuery } from '../../util/docNodes'

/**
 * The page displays posts feed.
 */
export const PostsPage = () => {
  const postsResult = useQuery(postsQuery, {
    fetchPolicy: 'cache-first',
  })

  return <section className='posts-page'></section>
}
