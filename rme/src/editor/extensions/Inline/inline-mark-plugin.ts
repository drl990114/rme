import { TextSelection, type Transaction } from '@rme-sdk/pm/state'
import type { EditorView } from '@rme-sdk/pm/view'

import { PlainExtension } from '@rme-sdk/main'
import { applySelectionMarks } from './inline-mark-helpers'

export class LineInlineMarkExtension extends PlainExtension {
  get name() {
    return 'inlineMark' as const
  }

  createPlugin() {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const debounceApplyMarks = (view: EditorView): void => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(() => {
        applySelectionMarks(view)

        const { $head } = view.state.selection
        view.dispatch(view.state.tr.setSelection(new TextSelection($head)))

        timeoutId = null
      }, 10)
    }

    let view: EditorView | null = null

    return {
      appendTransaction: (transactions: readonly Transaction[]): Transaction | null | undefined => {
        let shouldUpdate = false

        for (const tr of transactions) {
          if (tr.docChanged && !tr.getMeta('APPLY_MARKS')) {
            shouldUpdate = true
            break
          }
        }

        if (shouldUpdate && view && !view.isDestroyed) {
          debounceApplyMarks(view)
        }
        return
      },

      view: (editorView: EditorView | null) => {
        view = editorView
        return {}
      },
    }
  }
}
