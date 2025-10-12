import type { NodeSelection, Selection } from '@rme-sdk/pm/state'

export function isNodeSelection(
  selection: Selection,
): selection is NodeSelection {
  return Boolean((selection as NodeSelection).node)
}
