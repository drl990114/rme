import type { ResolvedPos } from '@remirror/pm/model'
import type { EditorState, TextSelection } from '@remirror/pm/state'
import type { EditorView } from '@remirror/pm/view'

export function atTextblockStart(
  state: EditorState,
  view?: EditorView,
): ResolvedPos | null {
  const { $cursor } = state.selection as TextSelection
  if (
    !$cursor ||
    (view ? !view.endOfTextblock('backward', state) : $cursor.parentOffset > 0)
  )
    return null
  return $cursor
}
