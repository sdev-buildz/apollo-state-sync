import { Card, CardContent } from '@mui/material'
import type { Post } from '@types-gen-react-apollo'

/**
 * A post card
 */
export const PostCard = ({ post }: { post: Post }) => {
  return (
    <Card component='article' key={post.id} className='post'>
      <CardContent>
        <h3>{post.title}</h3>
        <p>{post.body}</p>
      </CardContent>
    </Card>
  )
}
