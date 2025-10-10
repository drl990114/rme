import type { ResolvedPos } from '@remirror/pm/model'
import type { EditorState, TextSelection } from '@remirror/pm/state'
import type { EditorView } from '@remirror/pm/view'

export function atTextblockEnd(
  state: EditorState,
  view?: EditorView,
): ResolvedPos | null {
  const { $cursor } = state.selection as TextSelection
  if (
    !$cursor ||
    (view
      ? !view.endOfTextblock('forward', state)
      : $cursor.parentOffset < $cursor.parent.content.size)
  )
    return null
  return $cursor
}
