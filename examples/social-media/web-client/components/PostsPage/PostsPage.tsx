import { useQuery } from '@apollo/client/react'
import GroupsIcon from '@mui/icons-material/Groups'
import { postsQuery } from '../../util/docNodes'
import { PostCard } from './PostCard'

/**
 * Displays posts.
 */
export const PostsPage = () => {
  const postsResult = useQuery(postsQuery, {
    fetchPolicy: 'cache-first',
  })

  return (
    <section className='posts-page'>
      <hgroup>
        <h2>
          <GroupsIcon /> Posts
        </h2>
        <p>Engage with the community by sharing posts and comments.</p>
      </hgroup>

      {/* Posts */}
      <section className='posts'>
        {postsResult.data?.posts?.data?.map((post) =>
          post ? <PostCard post={post} key={post.id} /> : <></>
        )}
      </section>
    </section>
  )
}
