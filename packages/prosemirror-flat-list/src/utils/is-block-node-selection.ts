import type { NodeSelection, Selection } from '@remirror/pm/state'

import { isNodeSelection } from './is-node-selection'

export function isBlockNodeSelection(
  selection: Selection,
): selection is NodeSelection {
  return isNodeSelection(selection) && selection.node.type.isBlock
}
