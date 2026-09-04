import { typedObjectEntries } from 'ts-strict-utils'
import type { Application, CommentDisplayPart } from 'typedoc'
import { Converter } from 'typedoc'

/**
 * Load the AST.
 */
export function load(app: Application) {
  app.converter.on(Converter.EVENT_RESOLVE_BEGIN, (context) => {
    // Traverse all reflections in the project
    typedObjectEntries(context.project.reflections).forEach(
      ([, reflection]) => {
        if (reflection.comment) {
          // Modify block tags
          reflection.comment.blockTags.forEach((tag) => {
            tag.content.forEach((part) => {
              parseAndRewriteLink(part)
            })
          })

          // Modify summary text
          reflection.comment.summary.forEach((part) => {
            parseAndRewriteLink(part)
          })
        }
      }
    )
  })
}

/*
 * Parse and edit the text.
 */
function parseAndRewriteLink(part: CommentDisplayPart) {
  if (!(
    part.kind === 'inline-tag' &&
    (part.tag === '@link' ||
      part.tag === '@linkcode' ||
      part.tag === '@linkplain')
  )) {
    return
  }
  if (typeof part.text === 'string') {
    const [linkPart, textPart] = part.text.trim().split('|')

    // If the link part is a valid URL, we don't need to modify.
    try {
      new URL(linkPart ?? '')
      return
    } catch (error) {
      //
    }

    if (textPart) {
      part.text = textPart.trim()
    }
  }
}
