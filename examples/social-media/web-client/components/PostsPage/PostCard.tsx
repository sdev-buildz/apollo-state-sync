import { Card, CardContent, Typography } from '@mui/material'
import type { Post } from '@types-gen-react-apollo'

/**
 * A post card
 */
export const PostCard = ({ post }: { post: Post }) => {
  return (
    <Card component='article' key={post.id} className='post'>
      <CardContent>
        <Typography variant='h6' color='primary'>
          {`${post.id}) ${post.title}`}
        </Typography>
        <p>{post.body}</p>
        <Typography variant='button' color='secondary'>
          Comments
        </Typography>
        {post.comments?.data?.map((comment) => (
          <article
            style={{
              marginBlock: '1rem',
              border: `1px solid grey`,
              padding: `1rem`,
            }}
          >
            <Typography variant='body2' color='tertiaryVariant'>
              {comment?.name}
            </Typography>
            <Typography variant='caption'>{comment?.body}</Typography>
          </article>
        ))}
      </CardContent>
    </Card>
  )
}
