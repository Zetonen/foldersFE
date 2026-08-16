import type { ComponentPropsWithoutRef, ElementType } from 'react'

interface UserTextProps extends ComponentPropsWithoutRef<'span'> {
  /** `span` by default; `p` or `li` where the surrounding markup needs it. */
  as?: ElementType
}

/**
 * Content that came from a user rather than from the interface: a file or
 * folder name, a data room name, an email address.
 *
 * `translate="no"` asks in-page translators — Google Translate, the browser's
 * built-in one, the extensions — to leave it alone, which matters twice over.
 *
 * A file called "Goal.pdf" is a name, not a sentence: a translated copy of it
 * no longer matches what the user typed, or what the server stores. And a
 * translator does not edit text in place — it detaches the text node React put
 * there and inserts a `<font>` element of its own in its stead. React goes on
 * holding the detached node, so the next update around it (a rename, a delete,
 * a row shifting up the list) reaches for a node that is no longer a child of
 * its parent, and the DOM answers `NotFoundError` — taking the screen down
 * through the error boundary. Names are the text this app re-renders most, so
 * that is where it landed. Marked this way they are never rewritten.
 */
export function UserText({ as: Tag = 'span', ...props }: UserTextProps) {
  return <Tag translate="no" {...props} />
}
