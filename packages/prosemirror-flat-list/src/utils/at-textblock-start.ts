import type { ResolvedPos } from '@rme-sdk/pm/model'
import type { EditorState, TextSelection } from '@rme-sdk/pm/state'
import type { EditorView } from '@rme-sdk/pm/view'

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
