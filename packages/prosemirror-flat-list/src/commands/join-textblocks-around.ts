/* eslint-disable prefer-const */

import { type ResolvedPos, Slice } from '@rme-sdk/pm/model'
import { TextSelection, type Transaction } from '@rme-sdk/pm/state'
import { replaceStep, ReplaceStep } from '@rme-sdk/pm/transform'

// prettier-ignore
function joinTextblocksAround(tr: Transaction, $cut: ResolvedPos, dispatch?: (tr: Transaction) => void) {
  let before = $cut.nodeBefore!, beforeText = before, beforePos = $cut.pos - 1
  for (; !beforeText.isTextblock; beforePos--) {
    if (beforeText.type.spec.isolating) return false
    let child = beforeText.lastChild
    if (!child) return false
    beforeText = child
  }
  let after = $cut.nodeAfter!, afterText = after, afterPos = $cut.pos + 1
  for (; !afterText.isTextblock; afterPos++) {
    if (afterText.type.spec.isolating) return false
    let child = afterText.firstChild
    if (!child) return false
    afterText = child
  }
  let step = replaceStep(tr.doc, beforePos, afterPos, Slice.empty) as ReplaceStep | null
  if (!step || step.from != beforePos ||
      step instanceof ReplaceStep && step.slice.size >= afterPos - beforePos) return false
  if (dispatch) {
    tr.step(step)
    tr.setSelection(TextSelection.create(tr.doc, beforePos))
    dispatch(tr.scrollIntoView())
  }
  return true

}

export { joinTextblocksAround }
