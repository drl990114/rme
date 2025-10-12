import type { ResolvedPos } from '@rme-sdk/pm/model'
import type { EditorState, TextSelection } from '@rme-sdk/pm/state'
import type { EditorView } from '@rme-sdk/pm/view'

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
