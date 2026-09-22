import { useQuery } from '@apollo/client/react'
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from '@mui/material'
import { type Post } from '@types-gen-react-apollo'
import { useState } from 'react'
import { commentsOfPostQuery } from '../../util/docNodes'

/**
 * A post card with comments
 */
export const PostCard = ({ post }: { post: Post }) => {
  const [shouldQueryComments, setShouldQueryComments] = useState<boolean>(false)
  const commentsResult = useQuery(commentsOfPostQuery, {
    initialFetchPolicy: 'cache-only',
    fetchPolicy: !shouldQueryComments ? `cache-only` : 'cache-first',
    variables: {
      postId: post!.id!,
      commentsOptions: {
        paginate: {
          limit: 2,
          page: 1,
        },
      },
    },
  })

  return (
    <Card component='article' key={post.id} className='post'>
      <CardContent>
        {/* Post title */}
        <Typography variant='h6' color='primary'>
          {`${post.id}) ${post.title}`}
        </Typography>

        {/* Post body */}
        <p>{post.body}</p>

        {!commentsResult.data ? (
          <CardActions>
            {/* 'Fetch Comments' button */}
            <Button
              variant='outlined'
              color='secondary'
              onClick={() => {
                setShouldQueryComments(!shouldQueryComments)
                commentsResult.refetch()
              }}
            >
              Fetch Comments
            </Button>
          </CardActions>
        ) : (
          <>
            {/* Comments */}
            <Typography variant='button' color='secondary'>
              Comments
            </Typography>
            {commentsResult?.data?.post?.comments?.data?.map((comment) => (
              <article
                key={comment?.id}
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
          </>
        )}
      </CardContent>
    </Card>
  )
}
