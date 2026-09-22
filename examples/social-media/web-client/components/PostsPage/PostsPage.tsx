import { useQuery } from '@apollo/client/react'
import GroupsIcon from '@mui/icons-material/Groups'
import Masonry from '@mui/lab/Masonry'
import { useEffect, useState } from 'react'
import { postsQuery } from '../../util/docNodes'
import { PostCard } from './PostCard'

/**
 * Displays posts.
 */
export const PostsPage = () => {
  const postsResult = useQuery(postsQuery, {
    variables: {
      options: {
        paginate: {
          limit: 10,
          page: 1,
        },
      },
    },
    fetchPolicy: 'cache-first',
  })
  const [colsCount, setColsCount] = useState<number>(3)
  const colWidthInRem = 20
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]!
      setColsCount(
        Math.floor(
          entry.contentBoxSize[0]!.inlineSize / ((colWidthInRem + 1) * 16)
        )
      )
    })
    observer.observe(document.getElementsByClassName('posts')[0]!)
  }, [])

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
        <Masonry columns={colsCount}>
          <>
            {postsResult.data?.posts?.data?.map((post, postIdx) => {
              return post ? <PostCard post={post} key={post.id} /> : <></>
            })}
          </>
        </Masonry>
      </section>
    </section>
  )
}
